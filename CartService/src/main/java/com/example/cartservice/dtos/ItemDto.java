package com.example.cartservice.dtos;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class ItemDto implements Serializable {
    private String productId;
    private int quantity;
}
