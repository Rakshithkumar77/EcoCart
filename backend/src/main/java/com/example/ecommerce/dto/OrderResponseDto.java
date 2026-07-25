package com.example.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private AddressResponseDto shippingAddress;
    private String paymentStatus;
    private String paymentMethod;
    private List<OrderItemResponseDto> items;
    private LocalDateTime createdAt;
}
