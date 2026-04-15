package com.example.cartservice.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Getter
@Setter
public class CartItem extends BaseModel implements Serializable {
    @ManyToOne
    @JoinColumn
    @JsonIgnore
    private Cart cart;
    private String productId;
    private int quantity;
}
