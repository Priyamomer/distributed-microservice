package com.example.gateway.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.SmartLifecycle;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.stereotype.Component;

@Component
public class RedisConnectionValidator implements SmartLifecycle {
    private static final Logger logger = LoggerFactory.getLogger(RedisConnectionValidator.class);

    private final Environment environment;
    private final RedisConnectionFactory redisConnectionFactory;
    private boolean running = false;

    public RedisConnectionValidator(Environment environment, RedisConnectionFactory redisConnectionFactory) {
        this.environment = environment;
        this.redisConnectionFactory = redisConnectionFactory;

        // Log the actual Redis connection properties being used
        String redisHost = environment.getProperty("spring.data.redis.host");
        String redisPort = environment.getProperty("spring.data.redis.port");
        logger.info("Configured Redis connection - Host: {}, Port: {}", redisHost, redisPort);
    }

    @Override
    public void start() {
        // Get the actual Redis connection properties from environment
        String redisHost = environment.getProperty("spring.data.redis.host");
        String redisPort = environment.getProperty("spring.data.redis.port");

        logger.info("Attempting to connect to Redis at {}:{}", redisHost, redisPort);

        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            connection.ping();
            running = true;
            logger.info("Successfully connected to Redis at {}:{}", redisHost, redisPort);
        } catch (Exception e) {
            String errorMessage = String.format(
                    "Failed to connect to Redis at %s:%s - %s",
                    redisHost,
                    redisPort,
                    e.getMessage()
            );
            logger.error(errorMessage);
            throw new IllegalStateException(errorMessage, e);
        }
    }

    @Override
    public void stop() {
        running = false;
        logger.info("Redis connection validator stopped");
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return 0;
    }

    @Override
    public boolean isAutoStartup() {
        return true;
    }

    @Override
    public void stop(Runnable callback) {
        stop();
        callback.run();
    }
}