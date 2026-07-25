package com.example.ecommerce.mapper;

import com.example.ecommerce.dto.WishlistResponseDto;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.ProductImage;
import com.example.ecommerce.entity.Wishlist;

public class WishlistMapper {

    public static WishlistResponseDto toResponseDto(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }

        Product product = wishlist.getProduct();
        String primaryImageUrl = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            primaryImageUrl = product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(product.getImages().get(0).getImageUrl());
        }

        return WishlistResponseDto.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .productPrice(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .imageUrl(primaryImageUrl)
                .build();
    }
}
