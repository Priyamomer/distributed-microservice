package com.example.notificationservice.Consumers;

import com.example.notificationservice.dtos.MessageRequestDto;
import com.example.notificationservice.services.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Component
public class MessageConsumer {
    private final SmsService smsService;
    //These topics and groupId values overrides the default values that we have given
    @Autowired
    MessageConsumer(SmsService smsService, ConsumerRecord<String, String> record){
        this.smsService=smsService;
    }
    @KafkaListener(topics = "my-topic-3", groupId = "group_1")
    public void listen(MessageRequestDto message,ConsumerRecord<String, String> record) {
        long offset = record.offset();
        System.out.println("Value of the offset is "+offset);
        System.out.println("Topic is "+record.topic());
        System.out.println("Partition is "+record.partition());
        System.out.println("Received message:");
        smsService.sendMessage(message.getPhoneNumber(), message.getMessage());
        System.out.println(smsService.sendMessage(message.getPhoneNumber(), message.getMessage()));
        System.out.println("The Message has been send By the Consumer");
    }






//    @KafkaListener(topics = "my-topic-2", groupId = "group_1")
//    public void listen2(MessageRequestDto message) {
//        System.out.println("Received message:");
//        smsService.sendMessage(message.getPhoneNumber(), message.getMessage());
//        System.out.println(smsService.sendMessage(message.getPhoneNumber(), message.getMessage()));
//    }
//    @KafkaListener(topics = "my-topic-2", groupId = "my-group-id-2")
//    public void listen2(MessageRequestDto message) {
//        System.out.println("Received message:");
//        smsService.sendMessage(message.getPhoneNumber(), message.getMessage());
//        System.out.println(smsService.sendMessage(message.getPhoneNumber(), message.getMessage()));
//    }

}
