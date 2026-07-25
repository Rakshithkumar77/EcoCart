package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {
    @NotNull(message = "Shipping address ID is required")
    private Long addressId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String couponCode;
}
