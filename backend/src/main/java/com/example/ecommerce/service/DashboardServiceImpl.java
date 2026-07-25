package com.example.ecommerce.service;

import com.example.ecommerce.dto.DashboardStatsResponse;
import com.example.ecommerce.dto.OrderResponseDto;
import com.example.ecommerce.dto.ProductResponseDto;
import com.example.ecommerce.mapper.OrderMapper;
import com.example.ecommerce.mapper.ProductMapper;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        log.info("Fetching dashboard statistics for Admin");

        BigDecimal totalRevenue = orderRepository.sumTotalAmountExceptCancelled();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        List<OrderResponseDto> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(OrderMapper::toResponseDto)
                .collect(Collectors.toList());

        // Products with stock < 10 are considered low stock
        List<ProductResponseDto> lowStockProducts = productRepository.findByStockQuantityLessThanAndIsActiveTrue(10).stream()
                .map(ProductMapper::toResponseDto)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .recentOrders(recentOrders)
                .lowStockProducts(lowStockProducts)
                .build();
    }
}
