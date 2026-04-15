package com.example.orderservice.dtos;

import com.example.orderservice.models.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderPaymentStatusUpdateDto {
    public String orderId;
    public OrderStatus orderStatus;
}
