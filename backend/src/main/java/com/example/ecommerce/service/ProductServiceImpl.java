package com.example.ecommerce.service;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.ProductRequestDto;
import com.example.ecommerce.dto.ProductResponseDto;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.ProductImage;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.mapper.ProductMapper;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductImageRepository;
import com.example.ecommerce.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ProductResponseDto> getFilteredProducts(
            String categorySlug, BigDecimal minPrice, BigDecimal maxPrice,
            String search, String sort, int page, int size) {
        
        log.info("Filtering products: category={}, minPrice={}, maxPrice={}, search={}, sort={}, page={}, size={}",
                categorySlug, minPrice, maxPrice, search, sort, page, size);

        // Define sort parameter
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt"); // Default
        if (sort != null && !sort.trim().isEmpty()) {
            if (sort.equalsIgnoreCase("price_asc") || sort.equalsIgnoreCase("price,asc")) {
                sortOrder = Sort.by(Sort.Direction.ASC, "price");
            } else if (sort.equalsIgnoreCase("price_desc") || sort.equalsIgnoreCase("price,desc")) {
                sortOrder = Sort.by(Sort.Direction.DESC, "price");
            } else if (sort.equalsIgnoreCase("newest") || sort.equalsIgnoreCase("createdAt,desc")) {
                sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
            } else if (sort.equalsIgnoreCase("popularity") || sort.equalsIgnoreCase("rating,desc") || sort.equalsIgnoreCase("ratingAvg,desc")) {
                sortOrder = Sort.by(Sort.Direction.DESC, "ratingAvg");
            }
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        // Build specifications
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categorySlug != null && !categorySlug.trim().isEmpty()) {
                java.util.Optional<Category> optCategory = categoryRepository.findBySlug(categorySlug);
                if (optCategory.isPresent()) {
                    Category category = optCategory.get();
                    List<Long> categoryIds = new ArrayList<>();
                    categoryIds.add(category.getId());
                    if (category.getSubCategories() != null) {
                        for (Category sub : category.getSubCategories()) {
                            categoryIds.add(sub.getId());
                            if (sub.getSubCategories() != null) {
                                for (Category subSub : sub.getSubCategories()) {
                                    categoryIds.add(subSub.getId());
                                }
                            }
                        }
                    }
                    predicates.add(root.get("category").get("id").in(categoryIds));
                } else {
                    predicates.add(cb.equal(root.get("category").get("id"), -1L));
                }
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern),
                        cb.like(cb.lower(root.get("sku")), searchPattern)
                ));
            }

            // Publicly only display active products
            predicates.add(cb.equal(root.get("isActive"), true));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        List<ProductResponseDto> mappedList = productPage.getContent().stream()
                .map(ProductMapper::toResponseDto)
                .collect(Collectors.toList());

        return PaginatedResponse.fromPage(productPage, mappedList);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        log.info("Fetching product by id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductMapper.toResponseDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto getProductBySlug(String slug) {
        log.info("Fetching product by slug: {}", slug);
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return ProductMapper.toResponseDto(product);
    }

    @Override
    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto request) {
        log.info("Creating product: SKU={}", request.getSku());
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String slug = CategoryServiceImpl.toSlug(request.getName());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 1000;
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity())
                .sku(request.getSku())
                .category(category)
                .ratingAvg(0.0)
                .isActive(true)
                .build();

        Product savedProduct = productRepository.save(product);

        // Add images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(ProductImage.builder()
                        .product(savedProduct)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0) // Set first image as primary
                        .build());
            }
            productImageRepository.saveAll(images);
            savedProduct.setImages(images);
        }

        return ProductMapper.toResponseDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto request) {
        log.info("Updating product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setSlug(CategoryServiceImpl.toSlug(request.getName()));

        // Update images
        if (request.getImageUrls() != null) {
            // Delete old images
            if (product.getImages() != null) {
                productImageRepository.deleteAll(product.getImages());
                product.getImages().clear();
            }
            
            // Save new images
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .build());
            }
            productImageRepository.saveAll(images);
            product.setImages(images);
        }

        Product updatedProduct = productRepository.save(product);
        return ProductMapper.toResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deactivating product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        // Soft delete/deactivate instead of hard delete to preserve order history integrity
        product.setActive(false);
        productRepository.save(product);
    }
}
