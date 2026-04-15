package com.example.productservice.security;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Component
public class TokenValidator {

    private final RestTemplateBuilder restTemplateBuilder;

    public TokenValidator(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplateBuilder = restTemplateBuilder;
    }

    public SessionStatus validateToken(String token){
        RestTemplate restTemplate=restTemplateBuilder.build();
        ValidateTokenRequestDto validateTokenRequestDto=new ValidateTokenRequestDto(6L,token);
        ResponseEntity<SessionStatus> responseEntity = restTemplate.postForEntity("http://localhost:2000/auth/validate",validateTokenRequestDto,SessionStatus.class);

        return responseEntity.getBody();
    }
}
