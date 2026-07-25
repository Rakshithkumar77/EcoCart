package com.example.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productSku;
    private BigDecimal productPrice;
    private BigDecimal discountPrice;
    private String imageUrl;
    private int quantity;
    private BigDecimal priceAtAdd;
}
