package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    @Override
    @EntityGraph(attributePaths = {"category", "images"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"category", "images"})
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = {"category", "images"})
    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    boolean existsBySlug(String slug);
    List<Product> findByStockQuantityLessThanAndIsActiveTrue(Integer stockQuantity);
}

