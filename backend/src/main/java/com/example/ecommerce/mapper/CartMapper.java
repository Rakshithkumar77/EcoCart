package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.CartItemResponseDto;
import com.example.ecommerce.dto.CartResponseDto;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.ProductImage;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    public static CartItemResponseDto toItemResponseDto(CartItem item) {
        if (item == null) {
            return null;
        }

        Product product = item.getProduct();
        String primaryImageUrl = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            primaryImageUrl = product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(product.getImages().get(0).getImageUrl());
        }

        return CartItemResponseDto.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .productSku(product.getSku())
                .productPrice(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .imageUrl(primaryImageUrl)
                .quantity(item.getQuantity())
                .priceAtAdd(item.getPriceAtAdd())
                .build();
    }

    public static CartResponseDto toResponseDto(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemResponseDto> items = cart.getItems() != null ?
                cart.getItems().stream()
                        .map(CartMapper::toItemResponseDto)
                        .collect(Collectors.toList()) :
                Collections.emptyList();

        int totalQuantity = items.stream().mapToInt(CartItemResponseDto::getQuantity).sum();

        BigDecimal totalAmount = items.stream()
                .map(item -> {
                    BigDecimal activePrice = item.getDiscountPrice() != null ?
                            item.getDiscountPrice() : item.getProductPrice();
                    return activePrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponseDto.builder()
                .id(cart.getId())
                .items(items)
                .totalQuantity(totalQuantity)
                .totalAmount(totalAmount)
                .build();
    }
}
