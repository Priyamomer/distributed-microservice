package com.example.gateway.configurations;

import io.micrometer.common.KeyValue;
import io.micrometer.common.KeyValues;
import io.micrometer.common.lang.NonNullApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.observation.DefaultServerRequestObservationConvention;
import org.springframework.http.server.reactive.observation.ServerRequestObservationContext;
import org.springframework.http.server.reactive.observation.ServerHttpObservationDocumentation;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.util.AntPathMatcher;

import java.util.Optional;

@Configuration
@NonNullApi
public class MicrometerConfiguration {

    private static final String KEY_URI = "uri";
    private static final String UNKNOWN = "UNKNOWN";
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Bean
    public DefaultServerRequestObservationConvention uriTagContributorForObservationApi() {
        return new DefaultServerRequestObservationConvention() {
            @Override
            public KeyValues getLowCardinalityKeyValues(ServerRequestObservationContext context) {
                KeyValues lowCardinalityKeyValues = super.getLowCardinalityKeyValues(context);
//                System.out.println("Carrier type: " + context.getCarrier());
                ServerHttpRequest request = context.getCarrier();
//                System.out.println("Request Path: " + request.getPath());
//                System.out.println("Request URI: " + request.getURI());
//                System.out.println("Current KeyValues:");
                lowCardinalityKeyValues.forEach(kv ->
                        System.out.println("Key: " + kv.getKey() + ", Value: " + kv.getValue())
                );
                if (isUriTagNullOrUnknown(context, lowCardinalityKeyValues)) {

                    String path = request.getPath().value();
                    String normalizedPath = normalizeUri(path);
//                    return lowCardinalityKeyValues
//                            .and(KeyValue.of(KEY_URI, request.getPath().value()));
                    System.out.println("Replacing UNKNOWN URI with: " +normalizedPath);
                    return lowCardinalityKeyValues.and(KeyValue.of(KEY_URI, normalizedPath));
                }
                return lowCardinalityKeyValues;
            }

            private static boolean isUriTagNullOrUnknown(ServerRequestObservationContext context, KeyValues lowCardinalityKeyValues) {
                Optional<KeyValue> uriKeyValue = lowCardinalityKeyValues.stream()
                        .filter(keyValue -> ServerHttpObservationDocumentation.LowCardinalityKeyNames.URI.name()
                                .equals(keyValue.getKey()))
                        .findFirst();
                return (uriKeyValue.isEmpty() || UNKNOWN.equals(uriKeyValue.get().getValue()));
            }
            private String normalizeUri(String path) {
                if (pathMatcher.match("/v1/cart/**", path)) {
                    return "/v1/cart/**";
                }
                if (pathMatcher.match("/v1/orders/**", path)) {
                    return "/v1/orders/**";
                }
                if (pathMatcher.match("/v1/products", path)) {
                    return "/v1/products";
                }

                if (pathMatcher.match("/v1/products/**", path)) {
                    return "/v1/products/**";
                }
                return path;
            }
        };
    }
}