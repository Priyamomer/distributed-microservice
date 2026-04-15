package com.example.paymentservice.paymentgateway;

import com.razorpay.PaymentLink;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service("RazorPayPG")
public class RazorPayPaymentGateway implements PaymentGateway{
    @Override
    public String generatePaymentLink(String orderId, Long amount, String phoneNumber, String email) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient("", "");
        JSONObject paymentLinkRequest = new JSONObject();
        paymentLinkRequest.put("amount",1000);

        PaymentLink payment = razorpay.paymentLink.create(paymentLinkRequest);
        JSONObject paymentJson= payment.toJson();
        return paymentJson.getString("short_url");

    }
}
