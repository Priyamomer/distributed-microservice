package com.example.productservice.repositories;

import com.example.productservice.models.Price;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;


@Repository
public interface PriceRepository extends JpaRepository<Price, UUID> {
    @Override
    <S extends Price> S save(S entity);
     Optional<Price> findByAmountAndCurrency(int amount, String currency);
}
