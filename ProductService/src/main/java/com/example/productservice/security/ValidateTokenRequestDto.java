package com.example.productservice.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ValidateTokenRequestDto {
    Long userId;
    String token;
}
