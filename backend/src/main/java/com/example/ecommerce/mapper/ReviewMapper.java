package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.ReviewResponseDto;
import com.example.ecommerce.entity.Review;

public class ReviewMapper {

    public static ReviewResponseDto toResponseDto(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewResponseDto.builder()
                .id(review.getId())
                .userName(review.getUser() != null ? review.getUser().getName() : "Anonymous")
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
