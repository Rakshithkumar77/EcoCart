package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CategoryRequestDto;
import com.example.ecommerce.dto.CategoryResponseDto;
import com.example.ecommerce.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Categories", description = "Endpoints for category hierarchies and admin CRUD")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get category hierarchy", description = "Retrieves all root categories with their subcategories pre-populated in a tree structure.")
    @ApiResponse(responseCode = "200", description = "Categories loaded successfully")
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories() {
        log.info("REST request to get category tree");
        List<CategoryResponseDto> response = categoryService.getAllCategories();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single category by ID")
    @ApiResponse(responseCode = "200", description = "Category details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ResponseEntity<CategoryResponseDto> getCategoryById(@PathVariable Long id) {
        log.info("REST request to get category by id: {}", id);
        CategoryResponseDto response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a category (Admin only)", description = "Adds a category and optionally assigns a parent category ID.")
    @ApiResponse(responseCode = "200", description = "Category created successfully")
    @ApiResponse(responseCode = "400", description = "Category already exists")
    public ResponseEntity<CategoryResponseDto> createCategory(@Valid @RequestBody CategoryRequestDto request) {
        log.info("REST request to create category: {}", request.getName());
        CategoryResponseDto response = categoryService.createCategory(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a category (Admin only)")
    @ApiResponse(responseCode = "200", description = "Category updated successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ResponseEntity<CategoryResponseDto> updateCategory(
            @PathVariable Long id, 
            @Valid @RequestBody CategoryRequestDto request) {
        log.info("REST request to update category id: {}", id);
        CategoryResponseDto response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category (Admin only)")
    @ApiResponse(responseCode = "200", description = "Category deleted successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        log.info("REST request to delete category id: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
