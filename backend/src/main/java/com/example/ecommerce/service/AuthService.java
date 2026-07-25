package com.example.ecommerce.service;

import com.example.ecommerce.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
    TokenRefreshResponse refreshToken(TokenRefreshRequest tokenRefreshRequest);
    void logout(Long userId);
    UserResponseDto getCurrentUser(Long userId);
    PaginatedResponse<UserResponseDto> getAllUsers(int page, int size);
}
