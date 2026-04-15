package com.example.orderservice.services;

import com.example.orderservice.dtos.MessageRequestDto;
import com.example.orderservice.repositories.OrderRepository;
import com.example.orderservice.exception.InvalidParameterException;
import com.example.orderservice.models.OrderStatus;
import com.example.orderservice.models.Orders;
import com.example.orderservice.models.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    OrderRepository orderRepository;
    @Autowired
    private KafkaTemplate<String, MessageRequestDto> kafkaTemplate;
    public List<Orders> getOrders(String userId)  {
        return orderRepository.findAllByUserId(Long.parseLong(userId));
    }
    public Orders createOrder(String userId, List<OrderItem> orderItemList){
        Orders order = new Orders();
        order.setUserId(Long.parseLong(userId));
        order.setOrderItemList(orderItemList);
        order.setOrderStatus(OrderStatus.PAYMENT_PENDING);
        orderItemList.forEach(orderItem -> {
            orderItem.setOrder(order);
        });
        orderRepository.save(order);
        return order;
    }

    public String orderPaymentStatusUpdate(String orderId,OrderStatus orderStatus) throws InvalidParameterException {
        Orders orders=orderRepository.findById(Long.valueOf(orderId))
                .orElseThrow(()->new InvalidParameterException("Invalid UserId"));
        orders.setOrderStatus(orderStatus);
        orders.setLastUpdatedAt(LocalDateTime.now());
        orderRepository.save(orders);
        MessageRequestDto message=new MessageRequestDto(orderId,"+91 7275507575","The Product payment has been been updated with  "+orderStatus);
        kafkaTemplate.send("my-topic-2", message);

        return "Order Status updated successfully";
    }
}
