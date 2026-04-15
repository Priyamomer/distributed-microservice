package com.example.orderservice.models;

import com.example.orderservice.dtos.OrderRequestDto;
import com.example.orderservice.dtos.OrderResponseDto;
import com.example.orderservice.models.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Orders extends BaseModel{
    @OneToMany(mappedBy = "order",cascade = {CascadeType.PERSIST,CascadeType.MERGE})
    private List<OrderItem> orderItemList;
    private Long userId;
    @Enumerated(EnumType.ORDINAL)
    private OrderStatus orderStatus;



    public static OrderResponseDto toOrderResponseDto(Orders order){
        OrderResponseDto orderResponseDto=new OrderResponseDto();
        orderResponseDto.setOrderId(String.valueOf(order.getId()));
        orderResponseDto.setUserId(String.valueOf(order.getUserId()));
        orderResponseDto.setOrderItemList(order.getOrderItemList());
        orderResponseDto.setOrderStatus(order.getOrderStatus());
        return orderResponseDto;
    }

}
