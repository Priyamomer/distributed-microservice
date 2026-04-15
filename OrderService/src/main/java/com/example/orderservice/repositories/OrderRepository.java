package com.example.orderservice.repositories;

import com.example.orderservice.models.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders,Long> {
    //Optional<Orders> findAllByUserId(Long userId);
    List<Orders> findAllByUserId(Long userId);

    @Override
    <S extends Orders> S save(S entity);
}
