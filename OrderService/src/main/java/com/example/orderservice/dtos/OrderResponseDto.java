package com.example.orderservice.dtos;

import com.example.orderservice.models.OrderItem;
import com.example.orderservice.models.OrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderResponseDto {
    private String userId;
    private String orderId;
    private List<OrderItem> orderItemList;
    private OrderStatus orderStatus;
}
