package com.ftnam.image_ai_backend.service.impl;

import com.ftnam.image_ai_backend.dto.event.NotificationEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationPublisher {
    KafkaTemplate<String, Object> kafkaTemplate;

    public void sendNotification(String userId, String content) {
        NotificationEvent event = NotificationEvent.builder()
                .userId(userId)
                .content(content)
                .build();

        kafkaTemplate.send("notification-delivery", event);
    }
}
