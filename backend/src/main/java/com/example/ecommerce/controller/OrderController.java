package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CheckoutRequest;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.OrderService;
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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Endpoints for user checkouts and tracking personal purchase histories")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Perform order checkout", description = "Transforms the user's shopping cart into a pending order, decreases product stock, clears the cart, and optionally applies coupon deductions.")
    @ApiResponse(responseCode = "200", description = "Checkout completed and order placed successfully")
    @ApiResponse(responseCode = "400", description = "Cart empty, validation error, out-of-stock items, or invalid coupon")
    public ResponseEntity<OrderResponseDto> checkout(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CheckoutRequest request) {
        log.info("REST request to checkout for user: {}", userPrincipal.getId());
        OrderResponseDto response = orderService.checkout(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get user order history")
    @ApiResponse(responseCode = "200", description = "Order list retrieved successfully")
    public ResponseEntity<PaginatedResponse<OrderResponseDto>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get order history for user: {}", userPrincipal.getId());
        PaginatedResponse<OrderResponseDto> response = orderService.getUserOrderHistory(userPrincipal.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details", description = "Fetches a single order's transaction details. The user must be the owner of the order, or an admin.")
    @ApiResponse(responseCode = "200", description = "Order details loaded successfully")
    @ApiResponse(responseCode = "400", description = "Access denied to order record")
    @ApiResponse(responseCode = "404", description = "Order not found")
    public ResponseEntity<OrderResponseDto> getOrderDetails(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        log.info("REST request to view order detail id: {} for user: {}", id, userPrincipal.getId());
        OrderResponseDto response = orderService.getOrderDetails(userPrincipal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending order", description = "Cancels the order if it is still PENDING and returns purchased quantities back to the stock inventory.")
    @ApiResponse(responseCode = "200", description = "Order cancelled successfully")
    @ApiResponse(responseCode = "400", description = "Order status is not PENDING and cannot be cancelled")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        log.info("REST request to cancel order id: {} for user: {}", id, userPrincipal.getId());
        OrderResponseDto response = orderService.cancelOrder(userPrincipal.getId(), id);
        return ResponseEntity.ok(response);
    }
}
