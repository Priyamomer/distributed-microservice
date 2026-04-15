package com.example.paymentservice.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InitiatePaymentRequestDto {
    String orderId;
    private Long amount;
    private String phonNumber;
    private String email;
}
