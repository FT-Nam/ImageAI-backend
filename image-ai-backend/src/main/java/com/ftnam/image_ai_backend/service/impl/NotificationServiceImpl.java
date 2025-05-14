package com.ftnam.image_ai_backend.service.impl;

import com.ftnam.image_ai_backend.dto.request.NotificationCreationRequest;
import com.ftnam.image_ai_backend.dto.response.NotificationResponse;
import com.ftnam.image_ai_backend.entity.Notification;
import com.ftnam.image_ai_backend.entity.User;
import com.ftnam.image_ai_backend.exception.AppException;
import com.ftnam.image_ai_backend.exception.ErrorCode;
import com.ftnam.image_ai_backend.mapper.NotificationMapper;
import com.ftnam.image_ai_backend.repository.NotificationRepository;
import com.ftnam.image_ai_backend.repository.UserRepository;
import com.ftnam.image_ai_backend.service.NotificationService;
import com.ftnam.image_ai_backend.websocket.NotificationWebSocketPublisher;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    NotificationMapper notificationMapper;
    NotificationRepository notificationRepository;
    UserRepository userRepository;
    NotificationWebSocketPublisher notificationWebSocketPublisher;


    @Override
    public List<NotificationResponse> getNotificationsByUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow
                (()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Notification> notifications = user.getNotifications();

        return notifications.stream().map(notificationMapper::toNotificationResponse).toList();
    }

    @Override
    public NotificationResponse createNotification(NotificationCreationRequest request) {
        Notification notification = notificationMapper.toNotification(request);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        notification.setUser(user);

        Notification savedNotification = notificationRepository.save(notification);

        notificationWebSocketPublisher
                .sendNotificationToUser(user.getId(), notificationMapper.toNotificationResponse(savedNotification));

        return notificationMapper.toNotificationResponse(savedNotification);
    }

    @Override
    public NotificationResponse updateNotification(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        if(!notification.isRead()){
            notification.setRead(true);
        }

        return notificationMapper.toNotificationResponse(notificationRepository.save(notification));
    }
}
