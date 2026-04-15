package com.example.productservice.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.web.SecurityFilterChain;

import java.net.URI;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SpringSecurityConfig {
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception
             {
                 http
                         .authorizeHttpRequests(authorize -> authorize
                                 // Actuator endpoints
                                 .requestMatchers("/actuator/**").permitAll()
                                 .requestMatchers("/actuator/prometheus").permitAll()
                                 .requestMatchers("/actuator/health").permitAll()
                                 .requestMatchers("/actuator/info").permitAll()
                                 .requestMatchers("/actuator/metrics").permitAll()
                                 // All other requests need authentication
                                 .anyRequest().authenticated()
                         )
                         .csrf().disable()
                         .cors().disable()
                         .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()));

                 return http.build();
    }
}