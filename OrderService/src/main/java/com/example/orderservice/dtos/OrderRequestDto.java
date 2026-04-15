package com.example.orderservice.dtos;

import com.example.orderservice.models.OrderItem;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderRequestDto {
    private String userId;
    private List<OrderItem> orderItemList;
}
