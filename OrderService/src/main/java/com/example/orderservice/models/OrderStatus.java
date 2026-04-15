package com.example.orderservice.models;

public enum OrderStatus {
    PAYMENT_FAILURE,
    PAYMENT_PENDING,
    PAYMENT_SUCCESS,

    DELIVERY_WAITING,
    SHIPPING_AWAITING,
    SHIPPED,
    DELIVERED,
    CANCELLED,

    SUCCESSFUL
}
