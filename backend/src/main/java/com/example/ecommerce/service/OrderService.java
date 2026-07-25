package com.example.ecommerce.service;

import com.example.ecommerce.dto.CheckoutRequest;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.dto.PaginatedResponse;

public interface OrderService {
    OrderResponseDto checkout(Long userId, CheckoutRequest request);
    PaginatedResponse<OrderResponseDto> getUserOrderHistory(Long userId, int page, int size);
    OrderResponseDto getOrderDetails(Long userId, Long orderId);
    OrderResponseDto cancelOrder(Long userId, Long orderId);
    
    // Admin Operations
    PaginatedResponse<OrderResponseDto> getAllOrdersForAdmin(String status, int page, int size);
    OrderResponseDto updateOrderStatusForAdmin(Long orderId, String status);
}
