package com.example.cartservice.models;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
public class BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
    public BaseModel(){
        this.createdAt= LocalDateTime.now();
        this.lastUpdatedAt=LocalDateTime.now();
    }
}
