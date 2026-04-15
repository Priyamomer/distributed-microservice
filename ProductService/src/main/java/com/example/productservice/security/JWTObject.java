package com.example.productservice.security;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class JWTObject {
    private String email;
    private Long userId;
    private Date expirtyAt;
    private Date createdAt;
    private List<Role> roles;
}
