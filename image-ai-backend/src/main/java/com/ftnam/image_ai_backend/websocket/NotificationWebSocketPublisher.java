package com.ftnam.image_ai_backend.websocket;

import com.ftnam.image_ai_backend.dto.response.NotificationResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationWebSocketPublisher {
    SimpMessagingTemplate simpMessagingTemplate;

    public void sendNotificationToUser(String userId, NotificationResponse notificationResponse){
        simpMessagingTemplate.convertAndSend("/topic/notifications/" + userId, notificationResponse);
    }

}
