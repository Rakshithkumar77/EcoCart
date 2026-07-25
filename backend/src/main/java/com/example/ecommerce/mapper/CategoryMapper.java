package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.CategoryResponseDto;
import com.example.ecommerce.entity.Category;

import java.util.Collections;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryResponseDto toResponseDto(Category category) {
        if (category == null) {
            return null;
        }

        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .subCategories(category.getSubCategories() != null ?
                        category.getSubCategories().stream()
                                .map(CategoryMapper::toResponseDto)
                                .collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }
}
