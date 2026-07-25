package com.example.ecommerce.service;

import com.example.ecommerce.dto.CartItemRequestDto;
import com.example.ecommerce.dto.CartResponseDto;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.mapper.CartMapper;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponseDto getCartByUserId(Long userId) {
        log.info("Fetching cart for user: {}", userId);
        Cart cart = getOrCreateCart(userId);
        return CartMapper.toResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto addItemToCart(Long userId, CartItemRequestDto itemRequest) {
        log.info("Adding item to cart for user: {}, Product ID: {}, Qty: {}", userId, itemRequest.getProductId(), itemRequest.getQuantity());
        Cart cart = getOrCreateCart(userId);
        
        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("This product is no longer active.");
        }

        if (product.getStockQuantity() < itemRequest.getQuantity()) {
            throw new BadRequestException("Insufficient stock available. Available: " + product.getStockQuantity());
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + itemRequest.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Cannot add more of this item. Total requested exceeds stock.");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .priceAtAdd(product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return CartMapper.toResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto updateCartItemQuantity(Long userId, Long itemId, int quantity) {
        log.info("Updating cart item quantity: Item ID: {}, Qty: {}", itemId, quantity);
        Cart cart = getOrCreateCart(userId);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to the user's cart.");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            cart.getItems().remove(cartItem);
        } else {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return CartMapper.toResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto removeItemFromCart(Long userId, Long itemId) {
        log.info("Removing item from cart: User: {}, Item ID: {}", userId, itemId);
        Cart cart = getOrCreateCart(userId);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to the user's cart.");
        }

        cartItemRepository.delete(cartItem);
        cart.getItems().remove(cartItem);
        
        return CartMapper.toResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto clearCart(Long userId) {
        log.info("Clearing cart for user: {}", userId);
        Cart cart = getOrCreateCart(userId);
        
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        
        return CartMapper.toResponseDto(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }
}
