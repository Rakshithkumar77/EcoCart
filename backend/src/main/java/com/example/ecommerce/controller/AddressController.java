package com.example.ecommerce.controller;

import com.example.ecommerce.dto.AddressRequestDto;
import com.example.ecommerce.dto.AddressResponseDto;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Addresses", description = "Endpoints for managing user shipping addresses (JWT authentication required)")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Get user address list")
    @ApiResponse(responseCode = "200", description = "Addresses loaded successfully")
    public ResponseEntity<List<AddressResponseDto>> getMyAddresses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("REST request to get all addresses for user: {}", userPrincipal.getId());
        List<AddressResponseDto> response = addressService.getAddressesByUserId(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single address by ID")
    @ApiResponse(responseCode = "200", description = "Address details loaded successfully")
    @ApiResponse(responseCode = "400", description = "Access denied or validation failed")
    @ApiResponse(responseCode = "404", description = "Address not found")
    public ResponseEntity<AddressResponseDto> getAddressById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        log.info("REST request to get address ID: {} for user: {}", id, userPrincipal.getId());
        AddressResponseDto response = addressService.getAddressById(userPrincipal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create user address")
    @ApiResponse(responseCode = "200", description = "Address added successfully")
    public ResponseEntity<AddressResponseDto> createAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddressRequestDto request) {
        log.info("REST request to add address for user: {}", userPrincipal.getId());
        AddressResponseDto response = addressService.createAddress(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user address")
    @ApiResponse(responseCode = "200", description = "Address updated successfully")
    @ApiResponse(responseCode = "400", description = "Access denied or validation error")
    public ResponseEntity<AddressResponseDto> updateAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDto request) {
        log.info("REST request to update address ID: {} for user: {}", id, userPrincipal.getId());
        AddressResponseDto response = addressService.updateAddress(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete address")
    @ApiResponse(responseCode = "200", description = "Address deleted successfully")
    public ResponseEntity<String> deleteAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        log.info("REST request to delete address ID: {} for user: {}", id, userPrincipal.getId());
        addressService.deleteAddress(userPrincipal.getId(), id);
        return ResponseEntity.ok("Address deleted successfully");
    }
}
