//package com.example.notificationservice.config;
//
//import com.example.notificationservice.dtos.MessageRequestDto;
//import org.apache.kafka.clients.consumer.ConsumerConfig;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
//import org.springframework.kafka.core.ConsumerFactory;
//import org.apache.kafka.common.serialization.StringDeserializer;
//import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
//import org.springframework.kafka.support.serializer.JsonDeserializer;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Configuration
//public class ConsumerConfiguration2 {
//    @Bean
//    public ConsumerFactory<String, Object> consumerFactory() {
//        Map<String, Object> configProps = new HashMap<>();
//        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
//        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group-id-2");
//        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
//        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
//        configProps.put(JsonDeserializer.TRUSTED_PACKAGES,"com.example.notificationservice.*");
//        configProps.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, 10); // minimum amount of data to fetch in bytes
//        configProps.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 1000); // maximum amount of time to wait for data in milliseconds
//        //configProps.put(JsonDeserializer.TYPE_MAPPINGS,"MessageRequestDto:com/example/notificationservice/dtos/MessageRequestDto");
//        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, MessageRequestDto.class);
//        return new DefaultKafkaConsumerFactory<>(configProps);
//    }
//    @Bean
//    public ConcurrentKafkaListenerContainerFactory<String, MessageRequestDto> kafkaListenerContainerFactory() {
//        ConcurrentKafkaListenerContainerFactory<String, MessageRequestDto> factory = new ConcurrentKafkaListenerContainerFactory<>();
//        factory.setConsumerFactory(consumerFactory());
//
//        return factory;
//    }
//
//}
