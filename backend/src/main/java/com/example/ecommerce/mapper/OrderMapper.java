package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.OrderItemResponseDto;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.ProductImage;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderItemResponseDto toItemResponseDto(OrderItem item) {
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

        return OrderItemResponseDto.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .imageUrl(primaryImageUrl)
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .build();
    }

    public static OrderResponseDto toResponseDto(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponseDto> items = order.getItems() != null ?
                order.getItems().stream()
                        .map(OrderMapper::toItemResponseDto)
                        .collect(Collectors.toList()) :
                Collections.emptyList();

        return OrderResponseDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(AddressMapper.toResponseDto(order.getShippingAddress()))
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
