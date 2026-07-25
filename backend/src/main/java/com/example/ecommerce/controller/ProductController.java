package com.example.ecommerce.controller;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.ProductRequestDto;
import com.example.ecommerce.dto.ProductResponseDto;
import com.example.ecommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Products", description = "Endpoints for viewing catalog items, searching, and administrative CRUD operations")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get list of products", description = "Provides paginated sorting and advanced filters (category slug, price boundaries, keyword search).")
    @ApiResponse(responseCode = "200", description = "Products list loaded successfully")
    public ResponseEntity<PaginatedResponse<ProductResponseDto>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        log.info("REST request to list products with filters");
        PaginatedResponse<ProductResponseDto> response = productService.getFilteredProducts(
                category, minPrice, maxPrice, search, sort, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single product by ID")
    @ApiResponse(responseCode = "200", description = "Product details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long id) {
        log.info("REST request to get product detail by id: {}", id);
        ProductResponseDto response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get single product by SEO slug")
    @ApiResponse(responseCode = "200", description = "Product details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<ProductResponseDto> getProductBySlug(@PathVariable String slug) {
        log.info("REST request to get product detail by slug: {}", slug);
        ProductResponseDto response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product (Admin only)", description = "Adds a product item and binds image assets.")
    @ApiResponse(responseCode = "200", description = "Product created successfully")
    @ApiResponse(responseCode = "400", description = "Validation error or SKU conflict")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<ProductResponseDto> createProduct(@Valid @RequestBody ProductRequestDto request) {
        log.info("REST request to create new product with SKU: {}", request.getSku());
        ProductResponseDto response = productService.createProduct(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing product (Admin only)")
    @ApiResponse(responseCode = "200", description = "Product updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductRequestDto request) {
        log.info("REST request to update product id: {}", id);
        ProductResponseDto response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete/Deactivate a product (Admin only)", description = "Performs soft deactivation of products to retain consistency of prior checkout records.")
    @ApiResponse(responseCode = "200", description = "Product deactivated successfully")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        log.info("REST request to deactivate product id: {}", id);
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deactivated successfully");
    }
}
