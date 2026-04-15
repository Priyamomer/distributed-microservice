package com.example.gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(authorize -> authorize

                        .pathMatchers(HttpMethod.POST, "/v1/auth/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/v1/roles/**").authenticated()
                        .pathMatchers(HttpMethod.POST, "/v1/roles/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/v1/users/**").authenticated()
                        .pathMatchers(HttpMethod.POST, "/v1/users/**").permitAll()

                        .pathMatchers(HttpMethod.GET, "/v1/products/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/v1/products/**").permitAll()
                        .pathMatchers(HttpMethod.PATCH, "/v1/products/**").permitAll()
                        .pathMatchers(HttpMethod.PUT, "/v1/products/**").permitAll()
                        .pathMatchers(HttpMethod.DELETE, "/v1/products/**").permitAll()


                        .pathMatchers(HttpMethod.GET, "/v1/cart/**").authenticated()
                        .pathMatchers(HttpMethod.POST, "/v1/cart/**").permitAll()
                        .pathMatchers(HttpMethod.PATCH, "/v1/cart/**").permitAll()
                        .pathMatchers(HttpMethod.DELETE, "/v1/cart/**").permitAll()


                        .pathMatchers(HttpMethod.GET, "/v1/orders/**").authenticated()
                        .pathMatchers(HttpMethod.POST, "/v1/orders/**").permitAll()
                        .pathMatchers(HttpMethod.PATCH, "/v1/orders/**").permitAll()

                        .pathMatchers(HttpMethod.POST, "/v1/payments").permitAll()
                        .pathMatchers(HttpMethod.POST, "/v1/payments/webhooks").permitAll()

                        .pathMatchers(HttpMethod.POST, "/v1/notifications/send-message").permitAll()

                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/actuator/prometheus").permitAll()
                        .pathMatchers("/actuator/health").permitAll()
                        .pathMatchers("/actuator/info").permitAll()
                        .pathMatchers("/actuator/metrics").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2Login()
                .and()
                .oauth2Client()
                .and()
                .build();
    }
}