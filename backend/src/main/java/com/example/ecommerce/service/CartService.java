package com.example.ecommerce.service;

import com.example.ecommerce.dto.CartItemRequestDto;
import com.example.ecommerce.dto.CartResponseDto;

public interface CartService {
    CartResponseDto getCartByUserId(Long userId);
    CartResponseDto addItemToCart(Long userId, CartItemRequestDto itemRequest);
    CartResponseDto updateCartItemQuantity(Long userId, Long itemId, int quantity);
    CartResponseDto removeItemFromCart(Long userId, Long itemId);
    CartResponseDto clearCart(Long userId);
}
