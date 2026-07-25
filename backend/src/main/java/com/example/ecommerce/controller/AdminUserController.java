package com.example.ecommerce.controller;

import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.dto.UserResponseDto;
import com.example.ecommerce.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Users", description = "Endpoints for managing store accounts (Admin only)")
public class AdminUserController {

    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all store users", description = "Retrieves a paginated list of all registered store customer and admin accounts.")
    @ApiResponse(responseCode = "200", description = "Users list retrieved successfully")
    public ResponseEntity<PaginatedResponse<UserResponseDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        log.info("Admin request to list all registered users: page={}, size={}", page, size);
        PaginatedResponse<UserResponseDto> response = authService.getAllUsers(page, size);
        return ResponseEntity.ok(response);
    }
}
