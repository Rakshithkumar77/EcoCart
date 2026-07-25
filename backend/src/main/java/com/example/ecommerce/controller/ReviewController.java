package com.example.ecommerce.controller;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.ReviewRequestDto;
import com.example.ecommerce.dto.ReviewResponseDto;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reviews", description = "Endpoints for viewing and adding product reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get reviews list of a product", description = "Provides paginated reviews of a product.")
    @ApiResponse(responseCode = "200", description = "Reviews loaded successfully")
    public ResponseEntity<PaginatedResponse<ReviewResponseDto>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        log.info("REST request to list reviews for product ID: {}", productId);
        PaginatedResponse<ReviewResponseDto> response = reviewService.getReviewsByProduct(productId, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Add a review to a product", description = "Stores user review comment and rating (1-5), and recalculates aggregate average rating for the product.")
    @ApiResponse(responseCode = "200", description = "Review submitted successfully")
    @ApiResponse(responseCode = "400", description = "User already reviewed this product or validation error")
    public ResponseEntity<ReviewResponseDto> addReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequestDto request) {
        log.info("REST request to submit review on product: {} by user: {}", productId, userPrincipal.getId());
        ReviewResponseDto response = reviewService.addReview(userPrincipal.getId(), productId, request);
        return ResponseEntity.ok(response);
    }
}
