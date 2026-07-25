package com.example.ecommerce.service;

import com.example.ecommerce.dto.WishlistResponseDto;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.entity.Wishlist;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.mapper.WishlistMapper;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponseDto> getWishlistByUserId(Long userId) {
        log.info("Fetching wishlist for user: {}", userId);
        return wishlistRepository.findByUserId(userId).stream()
                .map(WishlistMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addProductToWishlist(Long userId, Long productId) {
        log.info("Adding product to wishlist: User: {}, Product: {}", userId, productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product is already in your wishlist.");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(wishlist);
    }

    @Override
    @Transactional
    public void removeProductFromWishlist(Long userId, Long productId) {
        log.info("Removing product from wishlist: User: {}, Product: {}", userId, productId);
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in your wishlist"));
        wishlistRepository.delete(wishlist);
    }
}
