package com.example.ecommerce.service;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.ReviewRequestDto;
import com.example.ecommerce.dto.ReviewResponseDto;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Review;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.mapper.ReviewMapper;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.ReviewRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ReviewResponseDto> getReviewsByProduct(Long productId, int page, int size) {
        log.info("Fetching reviews for product: {}, Page: {}", productId, page);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage = reviewRepository.findByProductId(productId, pageable);
        List<ReviewResponseDto> list = reviewPage.getContent().stream()
                .map(ReviewMapper::toResponseDto)
                .collect(Collectors.toList());
        return PaginatedResponse.fromPage(reviewPage, list);
    }

    @Override
    @Transactional
    public ReviewResponseDto addReview(Long userId, Long productId, ReviewRequestDto request) {
        log.info("Adding review by user: {}, for product: {}, Rating: {}", userId, productId, request.getRating());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Recalculate Product's ratingAvg
        List<Review> reviews = reviewRepository.findByProductId(productId);
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        // Round to 1 decimal place
        avg = Math.round(avg * 10.0) / 10.0;
        product.setRatingAvg(avg);
        productRepository.save(product);

        return ReviewMapper.toResponseDto(savedReview);
    }
}
