package com.example.orderservice.controllers;

import com.example.orderservice.repositories.OrderRepository;
import com.example.orderservice.services.OrderService;
import com.example.orderservice.dtos.OrderPaymentStatusUpdateDto;
import com.example.orderservice.dtos.OrderRequestDto;
import com.example.orderservice.dtos.OrderResponseDto;
import com.example.orderservice.exception.InvalidParameterException;
import com.example.orderservice.models.Orders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/orders")
public class OrderController {
    @Autowired
    OrderService orderService;
    @Autowired
    OrderRepository orderRepository;
    @GetMapping("/{userId}")
    public List<OrderResponseDto> getOrders(@PathVariable("userId") String userid) throws Exception {
        List<Orders>ordersList=orderService.getOrders(userid);
        return ordersList.stream()
                .map(Orders::toOrderResponseDto)
                .collect(Collectors.toList());
    }
    @PostMapping("")
    public OrderResponseDto createOrder(@RequestBody OrderRequestDto orderRequestDto)
    {
        Orders order =orderService.createOrder(
                orderRequestDto.getUserId(),
                orderRequestDto.getOrderItemList()
        );
        return Orders.toOrderResponseDto(order);
    }
    @PatchMapping("/payment-status")
    public ResponseEntity<String> orderStatusUpdate(@RequestBody OrderPaymentStatusUpdateDto orderPaymentStatusUpdateDto) throws InvalidParameterException {
        String result= orderService.orderPaymentStatusUpdate(orderPaymentStatusUpdateDto.getOrderId(),orderPaymentStatusUpdateDto.getOrderStatus());
        return ResponseEntity.ok(result);
    }
}
