package com.example.cartservice.dtos;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class CartDto implements Serializable {
    private String userId;
    private List<ItemDto> itemDtoList;
}
