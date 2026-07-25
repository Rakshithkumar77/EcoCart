package com.example.ecommerce.controller;

import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.dto.OrderStatusUpdateRequest;
import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Orders", description = "Endpoints for managing store order lifecycles (Admin only)")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all store orders", description = "Retrieves a paginated list of all orders, optionally filtered by order status.")
    @ApiResponse(responseCode = "200", description = "Orders list retrieved successfully")
    public ResponseEntity<PaginatedResponse<OrderResponseDto>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        log.info("Admin request to list all orders with status filter: {}", status);
        PaginatedResponse<OrderResponseDto> response = orderService.getAllOrdersForAdmin(status, page, size);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Updates order status (CONFIRMED/SHIPPED/DELIVERED/CANCELLED).")
    @ApiResponse(responseCode = "200", description = "Order status updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid order status value")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        log.info("Admin request to update order: {} status to: {}", id, request.getStatus());
        OrderResponseDto response = orderService.updateOrderStatusForAdmin(id, request.getStatus());
        return ResponseEntity.ok(response);
    }
}
