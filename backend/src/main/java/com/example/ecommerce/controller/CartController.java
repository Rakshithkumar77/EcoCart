package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CartItemRequestDto;
import com.example.ecommerce.dto.CartResponseDto;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.CartService;
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
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart", description = "Endpoints for managing user shopping carts (JWT authentication required)")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get user cart", description = "Retrieves active shopping cart items and aggregates totals for the authenticated shopper.")
    @ApiResponse(responseCode = "200", description = "Cart retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<CartResponseDto> getCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("REST request to fetch cart for user: {}", userPrincipal.getId());
        CartResponseDto response = cartService.getCartByUserId(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    @ApiResponse(responseCode = "200", description = "Item added to cart successfully")
    @ApiResponse(responseCode = "400", description = "Out of stock or invalid quantity")
    public ResponseEntity<CartResponseDto> addItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CartItemRequestDto itemRequest) {
        log.info("REST request to add item to cart for user: {}", userPrincipal.getId());
        CartResponseDto response = cartService.addItemToCart(userPrincipal.getId(), itemRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    @ApiResponse(responseCode = "200", description = "Cart item updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation or stock warning")
    public ResponseEntity<CartResponseDto> updateItemQuantity(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        log.info("REST request to update quantity of cart item: {} for user: {}", itemId, userPrincipal.getId());
        CartResponseDto response = cartService.updateCartItemQuantity(userPrincipal.getId(), itemId, quantity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    @ApiResponse(responseCode = "200", description = "Item removed successfully")
    public ResponseEntity<CartResponseDto> removeItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long itemId) {
        log.info("REST request to delete item: {} from cart of user: {}", itemId, userPrincipal.getId());
        CartResponseDto response = cartService.removeItemFromCart(userPrincipal.getId(), itemId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    @ApiResponse(responseCode = "200", description = "Cart cleared successfully")
    public ResponseEntity<CartResponseDto> clearCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("REST request to empty cart for user: {}", userPrincipal.getId());
        CartResponseDto response = cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
}
