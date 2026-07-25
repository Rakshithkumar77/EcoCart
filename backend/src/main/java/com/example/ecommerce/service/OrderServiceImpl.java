package com.example.ecommerce.service;

import com.example.ecommerce.dto.CheckoutRequest;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.dto.PaginatedResponse;
import com.example.ecommerce.entity.*;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.mapper.OrderMapper;
import com.example.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponseDto checkout(Long userId, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", userId);
        
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout an empty cart.");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to the authenticated user.");
        }

        // Calculate Subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal activePrice = item.getProduct().getDiscountPrice() != null ?
                    item.getProduct().getDiscountPrice() : item.getProduct().getPrice();
            subtotal = subtotal.add(activePrice.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Apply Coupon if present
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode().trim().toUpperCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + request.getCouponCode()));

            if (!coupon.isActive()) {
                throw new BadRequestException("Coupon is no longer active.");
            }

            if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Coupon has expired.");
            }

            if (coupon.getMinOrderValue() != null && subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new BadRequestException("Minimum order value for coupon is " + coupon.getMinOrderValue());
            }

            if (coupon.getDiscountType() == DiscountType.PERCENT) {
                discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            } else if (coupon.getDiscountType() == DiscountType.FLAT) {
                discount = coupon.getDiscountValue();
            }
        }

        BigDecimal totalAmount = subtotal.subtract(discount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        // Build Order
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Order order = Order.builder()
                .user(cart.getUser())
                .orderNumber(orderNumber)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .shippingAddress(address)
                .paymentStatus("PENDING")
                .paymentMethod(request.getPaymentMethod())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Convert CartItems to OrderItems & Deduct Stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice())
                    .build();
            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // Clear Cart
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Order created successfully: Order Number = {}", orderNumber);
        return OrderMapper.toResponseDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<OrderResponseDto> getUserOrderHistory(Long userId, int page, int size) {
        log.info("Fetching order history for user: {}", userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);
        List<OrderResponseDto> list = orderPage.getContent().stream()
                .map(OrderMapper::toResponseDto)
                .collect(Collectors.toList());
        return PaginatedResponse.fromPage(orderPage, list);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderDetails(Long userId, Long orderId) {
        log.info("Fetching order details: User ID = {}, Order ID = {}", userId, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Security check: Only owner or admin can view order
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!order.getUser().getId().equals(userId) && user.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You do not have permission to view this order.");
        }

        return OrderMapper.toResponseDto(order);
    }

    @Override
    @Transactional
    public OrderResponseDto cancelOrder(Long userId, Long orderId) {
        log.info("Cancelling order: User ID = {}, Order ID = {}", userId, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to cancel this order.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be cancelled. Current status is: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus("CANCELLED");

        // Return stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        Order updatedOrder = orderRepository.save(order);
        return OrderMapper.toResponseDto(updatedOrder);
    }

    // Admin Operations
    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<OrderResponseDto> getAllOrdersForAdmin(String status, int page, int size) {
        log.info("Fetching all orders for Admin: status={}", status);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Order> spec = (root, query, cb) -> {
            if (status != null && !status.trim().isEmpty()) {
                try {
                    OrderStatus orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
                    return cb.equal(root.get("status"), orderStatus);
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Invalid order status: " + status);
                }
            }
            return null;
        };

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        List<OrderResponseDto> list = orderPage.getContent().stream()
                .map(OrderMapper::toResponseDto)
                .collect(Collectors.toList());
        return PaginatedResponse.fromPage(orderPage, list);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatusForAdmin(Long orderId, String status) {
        log.info("Updating order status: Order ID: {}, Status: {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            order.setStatus(newStatus);
            
            // Set payment status based on order status for simple mock workflow
            if (newStatus == OrderStatus.DELIVERED) {
                order.setPaymentStatus("PAID");
            } else if (newStatus == OrderStatus.CANCELLED) {
                order.setPaymentStatus("REFUNDED");
            }
            
            Order updatedOrder = orderRepository.save(order);
            return OrderMapper.toResponseDto(updatedOrder);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }
    }
}
