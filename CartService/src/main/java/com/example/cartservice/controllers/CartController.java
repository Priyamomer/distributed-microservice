package com.example.cartservice.controllers;


import com.example.cartservice.dtos.CartDto;
import com.example.cartservice.dtos.ItemDto;
import com.example.cartservice.models.CartItem;
import com.example.cartservice.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @GetMapping("/{userId}")
    public CartDto getCart(@PathVariable("userId") String userId){
        return cartService.getCart(userId);
    }
    @PostMapping("/{userId}/items")
    public CartItem addItem(
            @PathVariable("userId") String userId,
            @RequestBody ItemDto itemDto){
        return cartService.addItem(userId,itemDto.getProductId(),
                itemDto.getQuantity());
    }
    @PatchMapping("/{userId}/items")
    public CartItem updateItem(
            @PathVariable("userId") String userId,
            @RequestBody ItemDto itemDto){
        return cartService.updateItem(userId,itemDto.getProductId(),itemDto.getQuantity());

    }
    @DeleteMapping("/{userId}/items")
    public String deleteItem(
            @PathVariable String userId,
            @RequestBody ItemDto itemDto){
        return cartService.deleteItem(userId,itemDto.getProductId());
    }

}
