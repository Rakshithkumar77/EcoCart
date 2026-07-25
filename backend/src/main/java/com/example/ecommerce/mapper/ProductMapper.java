package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.ProductResponseDto;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.ProductImage;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductResponseDto toResponseDto(Product product) {
        if (product == null) {
            return null;
        }

        List<String> imageUrls = product.getImages() != null ?
                product.getImages().stream()
                        .map(ProductImage::getImageUrl)
                        .collect(Collectors.toList()) :
                Collections.emptyList();

        return ProductResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .stockQuantity(product.getStockQuantity())
                .sku(product.getSku())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrls(imageUrls)
                .ratingAvg(product.getRatingAvg())
                .isActive(product.isActive())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
