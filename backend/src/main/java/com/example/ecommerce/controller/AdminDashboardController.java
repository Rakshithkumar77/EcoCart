package com.example.ecommerce.controller;

import com.example.ecommerce.dto.DashboardStatsResponse;
import com.example.ecommerce.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Dashboard", description = "Endpoints for retrieving administrative KPIs (Admin only)")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard stats", description = "Aggregates revenue, totals of orders/users/products, lists 5 recent orders, and identifies low-stock items.")
    @ApiResponse(responseCode = "200", description = "Stats compiled successfully")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        log.info("Admin request to compile dashboard KPIs");
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(response);
    }
}
