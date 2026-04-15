package com.example.cartservice.services;


import com.example.cartservice.dtos.CartDto;
import com.example.cartservice.models.Cart;
import com.example.cartservice.models.CartItem;
import com.example.cartservice.repositories.CartItemRepository;
import com.example.cartservice.repositories.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.InvalidParameterException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RedisTemplate<String,Object> redisTemplate;
    @Autowired
    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository, RedisTemplate<String, Object> redisTemplate) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.redisTemplate = redisTemplate;
    }

    public CartDto getCart(String userId){
        CartDto cartDto = (CartDto) redisTemplate.opsForHash().get("CARTS", userId);


        if(cartDto!=null){
            return cartDto;
        }
        Optional<Cart> cart= cartRepository.findByUserId(Long.parseLong(userId));
        if(cart.isEmpty()){
            throw new RuntimeException("Invalid UserId");
        }
        return Cart.toCartDto(cart.get());
    }
    public CartItem addItem(String userId, String productId, int quantity){
        Cart cart=cartRepository.findByUserId(Long.parseLong(userId))
                .orElseGet(()->{
                    Cart newCart=new Cart();
                    newCart.setUserId(Long.parseLong(userId));
                    newCart.setCartItemList(new ArrayList<>());
                    return  newCart;
                });
        CartItem cartItem=new CartItem();
        cartItem.setLastUpdatedAt(LocalDateTime.now());
        cartItem.setProductId(productId);
        cartItem.setQuantity(quantity);
        cartItem.setCart(cart);
        cart.getCartItemList().add(cartItem);
        redisTemplate.opsForHash().put("CARTS",userId,Cart.toCartDto(cart));
        return cartRepository.save(cart).getCartItemList().get(
                cart.getCartItemList().size()-1
        );
    }

    public CartItem updateItem(String userId, String productId, int quantity){
        Cart cart=cartRepository.findByUserId(Long.parseLong(userId)).orElseThrow(()->{
            throw new InvalidParameterException("Wrong UserId");
        });
        CartItem itemToUpdate=cart.getCartItemList().stream()
                .filter(item -> item.getProductId().equals(productId)).
                findFirst().orElseThrow(()-> new InvalidParameterException("No Such Product"));
        itemToUpdate.setQuantity(quantity);
        itemToUpdate.setLastUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);

        if(redisTemplate.opsForHash().get("CARTS",userId)!=null){
            redisTemplate.opsForHash().put("CARTS",userId,Cart.toCartDto(cart));
        }
        return itemToUpdate;
    }

    public String deleteItem(String userId, String productId){
        Cart cart=cartRepository.findByUserId(Long.parseLong(userId)).orElseThrow(()->{
            throw new InvalidParameterException("Wrong UserId");
        });
        CartItem itemToUpdate=cart.getCartItemList().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst().orElseThrow(()-> new InvalidParameterException("No Such Product"));
        cart.getCartItemList().remove(itemToUpdate);
        cartItemRepository.delete(itemToUpdate);
        if(redisTemplate.opsForHash().get("CARTS",userId)!=null){
            redisTemplate.opsForHash().put("CARTS",userId,Cart.toCartDto(cart));
        }
        return "Product successfully removed from the cart";
    }
}
