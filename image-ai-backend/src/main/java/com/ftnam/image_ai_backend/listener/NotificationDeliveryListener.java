package com.ftnam.image_ai_backend.listener;

import com.ftnam.image_ai_backend.dto.event.NotificationEvent;
import com.ftnam.image_ai_backend.dto.request.NotificationCreationRequest;
import com.ftnam.image_ai_backend.service.impl.NotificationServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationDeliveryListener {
    NotificationServiceImpl notificationService;

    @KafkaListener(topics = "notification-delivery")
    public void handleNotificationDelivery(NotificationEvent event){
        NotificationCreationRequest notificationCreationRequest = NotificationCreationRequest.builder()
                .content(event.getContent())
                .userId(event.getUserId())
                .build();

        notificationService.createNotification(notificationCreationRequest);
    }
}
