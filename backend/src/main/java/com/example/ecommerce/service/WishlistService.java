package com.example.ecommerce.service;

import com.example.ecommerce.dto.WishlistResponseDto;

import java.util.List;

public interface WishlistService {
    List<WishlistResponseDto> getWishlistByUserId(Long userId);
    void addProductToWishlist(Long userId, Long productId);
    void removeProductFromWishlist(Long userId, Long productId);
}
