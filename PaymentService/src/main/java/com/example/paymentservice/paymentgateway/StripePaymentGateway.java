package com.example.paymentservice.paymentgateway;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentLink;
import com.stripe.model.Price;
import com.stripe.model.Product;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("StripePG")
public class StripePaymentGateway implements PaymentGateway {

    private static final String CURRENCY = "inr";
    private static final String REDIRECT_URL = "https://scaler.com/";

    public String generatePaymentLink(String orderId, Long amount, String phoneNumber, String email) throws StripeException {
        Stripe.apiKey = "";


        Product product = createProduct(orderId);

        Price price = createPrice(amount, product.getId());

        Map<String, Object> paymentLinkParams = new HashMap<>();

        // Add line items
        List<Object> lineItems = new ArrayList<>();
        Map<String, Object> lineItem = new HashMap<>();
        lineItem.put("price", price.getId());
        lineItem.put("quantity", 1);
        lineItems.add(lineItem);
        paymentLinkParams.put("line_items", lineItems);

        // Add after payment redirect
        Map<String, Object> afterPayment = new HashMap<>();
        afterPayment.put("type", "redirect");
        Map<String, Object> redirect = new HashMap<>();
        redirect.put("url", REDIRECT_URL);
        afterPayment.put("redirect", redirect);
        paymentLinkParams.put("after_completion", afterPayment);

        // Add metadata to payment link
        Map<String, String> linkMetadata = new HashMap<>();
        linkMetadata.put("order_id", orderId);
        linkMetadata.put("phone_number", phoneNumber);
        linkMetadata.put("email", email);
        paymentLinkParams.put("metadata", linkMetadata);


        Map<String, Object> linkPaymentIntent = new HashMap<>();
        linkMetadata.put("description", "This is the PaymentIntentDescription");

        Map<String, String> paymentIntentMetaData = new HashMap<>();
        paymentIntentMetaData.put("OrderId",orderId);

        linkPaymentIntent.put("metadata",paymentIntentMetaData);

        paymentLinkParams.put("payment_intent_data", linkPaymentIntent);



        PaymentLink paymentLink = PaymentLink.create(paymentLinkParams);
        System.out.println("Created Payment Link ID: " + paymentLink.getId());


        return paymentLink.getUrl();
    }



    private Product createProduct(String orderId) throws StripeException {
        Map<String, Object> productData = new HashMap<>();
        productData.put("name", "iphone");
        productData.put("description", "This is latest tech we are offering");

        Map<String, String> productMetadata = new HashMap<>();
        productMetadata.put("order_id", orderId);
        productData.put("metadata", productMetadata);

        return Product.create(productData);
    }

    private Price createPrice(Long amount, String productId) throws StripeException {
        Map<String, Object> priceData = new HashMap<>();
        priceData.put("unit_amount", amount);
        priceData.put("currency", CURRENCY);
        priceData.put("product", productId);

        return Price.create(priceData);
    }
}