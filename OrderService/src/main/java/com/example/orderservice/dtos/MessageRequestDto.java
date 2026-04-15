package com.example.orderservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.jackson.JsonComponent;

@Getter
@Setter
@JsonComponent
@AllArgsConstructor
@NoArgsConstructor
public class MessageRequestDto {
    String userId;
    String phoneNumber;
    String message;
}
