package com.example.ecommerce.service;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.ProductRequestDto;
import com.example.ecommerce.dto.ProductResponseDto;

import java.math.BigDecimal;

public interface ProductService {
    PaginatedResponse<ProductResponseDto> getFilteredProducts(
            String categorySlug, BigDecimal minPrice, BigDecimal maxPrice, 
            String search, String sort, int page, int size, Boolean activeOnly);
            
    ProductResponseDto getProductById(Long id);
    ProductResponseDto getProductBySlug(String slug);
    ProductResponseDto createProduct(ProductRequestDto request);
    ProductResponseDto updateProduct(Long id, ProductRequestDto request);
    void deleteProduct(Long id);
}
