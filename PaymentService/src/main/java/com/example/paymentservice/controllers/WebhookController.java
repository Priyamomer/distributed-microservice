package com.example.paymentservice.controllers;

import com.example.paymentservice.dtos.OrderPaymentStatusUpdateDto;
import com.example.paymentservice.dtos.OrderStatus;
import com.google.gson.GsonBuilder;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentLink;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;



@RestController
@RequestMapping("/v1/payments")
public class WebhookController {
    private final RestTemplate restTemplate;
    private static final String WEBHOOK_SECRET = ""; // Add your webhook secret
    @Autowired
    WebhookController(RestTemplate restTemplate){
        this.restTemplate = restTemplate;
    }
    @PostMapping("/webhooks")
    public ResponseEntity<String> webhookInvoked(@RequestBody String payload,
                                                 @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = com.stripe.net.Webhook.constructEvent(
                    payload, sigHeader, WEBHOOK_SECRET
            );

            System.out.println("Received Stripe webhook event: " + event.getType());

            switch (event.getType()) {
                case "checkout.session.completed": {
                    com.stripe.model.checkout.Session session =
                            (com.stripe.model.checkout.Session) event.getData().getObject();
                    String orderId = session.getMetadata().get("order_id");
                    System.out.println("Payment completed for Order ID: " + orderId);
                    updateOrderStatus(orderId, OrderStatus.PAYMENT_SUCCESS);
                    break;
                }
                case "payment_intent.succeeded": {
                    PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
                    String orderId = paymentIntent.getMetadata().get("OrderId");

                    updateOrderStatus(orderId, OrderStatus.PAYMENT_SUCCESS);
                    break;
                }
                case "payment_intent.payment_failed": {
                    PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
                    String orderId = paymentIntent.getMetadata().get("OrderId");
                    updateOrderStatus(orderId, OrderStatus.PAYMENT_FAILURE);
                    break;
                }
                case "payment_link.created": {
                    PaymentLink paymentLink = (PaymentLink) event.getData().getObject();
                    String orderId = paymentLink.getMetadata().get("order_id");
                    System.out.println("Payment Link created for Order ID: " + orderId);
                    break;
                }
                default: {
                    LocalDateTime currentTime = LocalDateTime.now();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
                    String formattedTime = currentTime.format(formatter);
                    System.out.println("Unhandled event type " + event.getType() + " at " + formattedTime);
                }
            }
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.out.println("Webhook error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private void updateOrderStatus(String orderId, OrderStatus status) {
        try {
            OrderPaymentStatusUpdateDto orderUpdate = new OrderPaymentStatusUpdateDto();
            orderUpdate.setOrderId(orderId);
            orderUpdate.setOrderStatus(status);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<OrderPaymentStatusUpdateDto> request =
                    new HttpEntity<>(orderUpdate, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "http://ORDERSERVICE/v1/orders/payment-status",
                    HttpMethod.PATCH,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Successfully updated order status for Order ID: " + orderId);
            } else {
                System.out.println("Failed to update order status for Order ID: " + orderId);
            }

        } catch (Exception e) {
            System.out.println("Error updating order status: " + e.getMessage());
        }
    }

    private void logEventDetails(Event event) {
        try {
            System.out.println("Event ID: " + event.getId());
            System.out.println("Event Type: " + event.getType());
            System.out.println("Event Data: " + new GsonBuilder()
                    .setPrettyPrinting()
                    .create()
                    .toJson(event.getData()));
        } catch (Exception e) {
            System.out.println("Error logging event details: " + e.getMessage());
        }
    }
}
