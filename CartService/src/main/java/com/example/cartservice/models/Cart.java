package com.example.cartservice.models;

import com.example.cartservice.dtos.CartDto;
import com.example.cartservice.dtos.ItemDto;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Cart extends BaseModel implements Serializable {
    @OneToMany(mappedBy = "cart",
    cascade = {CascadeType.ALL})
    private List<CartItem> cartItemList;
    private Long userId;
    public static CartDto toCartDto(Cart cart){
        CartDto cartDto=new CartDto();
        cartDto.setUserId(String.valueOf(cart.getUserId()));

        List<ItemDto> itemDtoList= new ArrayList<>();
        for(CartItem cartItem: cart.getCartItemList()){
            ItemDto itemDto=new ItemDto();
            itemDto.setProductId(cartItem.getProductId());
            itemDto.setQuantity(cartItem.getQuantity());
            itemDtoList.add(itemDto);
        }
        cartDto.setItemDtoList(itemDtoList);
        return cartDto;
    }
}
