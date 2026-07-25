package com.example.ecommerce.service;

import com.example.ecommerce.dto.CategoryRequestDto;
import com.example.ecommerce.dto.CategoryResponseDto;

import java.util.List;

public interface CategoryService {
    List<CategoryResponseDto> getAllCategories();
    CategoryResponseDto getCategoryById(Long id);
    CategoryResponseDto getCategoryBySlug(String slug);
    CategoryResponseDto createCategory(CategoryRequestDto request);
    CategoryResponseDto updateCategory(Long id, CategoryRequestDto request);
    void deleteCategory(Long id);
}
