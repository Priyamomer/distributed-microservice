package com.example.paymentservice.controllers;

import com.example.paymentservice.dtos.InitiatePaymentRequestDto;
import com.example.paymentservice.dtos.OrderPaymentStatusUpdateDto;
import com.example.paymentservice.dtos.OrderStatus;
import com.example.paymentservice.services.PaymentService;
import com.google.gson.GsonBuilder;
import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentLink;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/v1/payments")
public class PaymentController {
    private final PaymentService paymentService;
    private final RestTemplate restTemplate;
    private static final String WEBHOOK_SECRET = ""; // Add your webhook secret

    @Autowired
    public PaymentController(PaymentService paymentService, RestTemplate restTemplate) {
        this.paymentService = paymentService;
        this.restTemplate = restTemplate;
    }

    @PostMapping("")
    public String initiatePayment(@RequestBody InitiatePaymentRequestDto request) throws StripeException, RazorpayException {
        return paymentService.initiatePayment(request.getOrderId(),
                request.getAmount(),
                request.getPhonNumber(),request.getEmail());
    }
}