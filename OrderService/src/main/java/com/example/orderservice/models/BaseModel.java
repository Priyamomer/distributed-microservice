package com.example.orderservice.models;

import com.fasterxml.jackson.databind.ser.Serializers;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;

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
