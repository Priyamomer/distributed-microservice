package com.example.paymentservice.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderPaymentStatusUpdateDto {
    public String orderId;
    public OrderStatus orderStatus;
}
