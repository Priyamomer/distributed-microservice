package com.example.notificationservice.dtos;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.jackson.JsonComponent;

import java.io.Serializable;

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
