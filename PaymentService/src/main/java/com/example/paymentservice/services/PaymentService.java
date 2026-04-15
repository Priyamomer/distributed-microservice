package com.example.paymentservice.services;

import com.example.paymentservice.paymentgateway.PaymentGateway;
import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
@Service
public class PaymentService {
    PaymentGateway paymentGateway;
    @Autowired
    public PaymentService(@Qualifier("StripePG") PaymentGateway paymentGateway){
        this.paymentGateway=paymentGateway;
    }

    public String initiatePayment(String orderId,Long orderAmount,String phoneNumber,String email) throws StripeException, RazorpayException {
        return paymentGateway.generatePaymentLink(orderId,orderAmount,phoneNumber,email);
    }
}
