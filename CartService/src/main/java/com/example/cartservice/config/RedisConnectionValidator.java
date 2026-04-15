package com.example.cartservice.config;

import org.springframework.context.SmartLifecycle;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

@Component
public class RedisConnectionValidator implements SmartLifecycle {

    private final RedisConnectionFactory redisConnectionFactory;
    private boolean running = false;

    public RedisConnectionValidator(RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @Override
    public void start() {
        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            connection.ping();  // Test connection
            running = true;  // If successful, mark as running
        } catch (Exception e) {
            System.err.println("Redis connection failed: " + e.getMessage());
            throw new IllegalStateException("Redis connection failed. Stopping application.", e);
        }
    }

    @Override
    public void stop() {
        running = false;
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return Integer.MAX_VALUE;  // Ensures this runs early in the startup phase
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
