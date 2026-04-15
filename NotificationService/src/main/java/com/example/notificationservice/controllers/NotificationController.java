package com.example.notificationservice.controllers;

import com.example.notificationservice.Producers.MessageProducer;
import com.example.notificationservice.dtos.MessageRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/notifications")
public class NotificationController {
        private final MessageProducer messageProducer;
        private final KafkaTemplate<String, MessageRequestDto> kafkaTemplate;
        @Autowired
        public NotificationController (MessageProducer messageProducer, MessageProducer messageProducer1, KafkaTemplate<String,MessageRequestDto> kafkaTemplate){
            this.messageProducer = messageProducer1;
            this.kafkaTemplate=kafkaTemplate;
        }

    @PostMapping("/send-message")
        public String sendMessage(@RequestBody MessageRequestDto messageRequest){
            messageProducer.sendMessage("my-topic-3",messageRequest);
            return "Message has been send";
        }

}
