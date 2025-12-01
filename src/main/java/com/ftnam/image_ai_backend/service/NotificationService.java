package com.ftnam.image_ai_backend.service;

import com.ftnam.image_ai_backend.dto.request.NotificationCreationRequest;
import com.ftnam.image_ai_backend.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotificationsByUser(String userId);

    NotificationResponse createNotification(NotificationCreationRequest request);

    NotificationResponse updateNotification(String id);

}
