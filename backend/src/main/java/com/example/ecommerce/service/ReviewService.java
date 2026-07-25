package com.example.ecommerce.service;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.ReviewRequestDto;
import com.example.ecommerce.dto.ReviewResponseDto;

public interface ReviewService {
    PaginatedResponse<ReviewResponseDto> getReviewsByProduct(Long productId, int page, int size);
    ReviewResponseDto addReview(Long userId, Long productId, ReviewRequestDto request);
}
