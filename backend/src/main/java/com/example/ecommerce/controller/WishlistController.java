package com.example.ecommerce.controller;

import com.example.ecommerce.dto.WishlistResponseDto;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Wishlist", description = "Endpoints for managing user watchlists (JWT authentication required)")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user wishlist")
    @ApiResponse(responseCode = "200", description = "Wishlist loaded successfully")
    public ResponseEntity<List<WishlistResponseDto>> getWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("REST request to view wishlist for user: {}", userPrincipal.getId());
        List<WishlistResponseDto> response = wishlistService.getWishlistByUserId(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add a product to user wishlist")
    @ApiResponse(responseCode = "200", description = "Product added to wishlist successfully")
    @ApiResponse(responseCode = "400", description = "Product already in wishlist")
    public ResponseEntity<String> addToWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        log.info("REST request to add product ID: {} to wishlist for user: {}", productId, userPrincipal.getId());
        wishlistService.addProductToWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok("Product added to wishlist successfully");
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove a product from wishlist")
    @ApiResponse(responseCode = "200", description = "Product removed successfully")
    public ResponseEntity<String> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        log.info("REST request to remove product ID: {} from wishlist for user: {}", productId, userPrincipal.getId());
        wishlistService.removeProductFromWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok("Product removed from wishlist successfully");
    }
}
