package com.example.notificationservice.Producers;

import com.example.notificationservice.dtos.MessageRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class MessageProducer {
    @Autowired
    private KafkaTemplate<String, MessageRequestDto> kafkaTemplate;

    public void sendMessage(String topic, MessageRequestDto message) {
        kafkaTemplate.send(topic, message);
    }

}
