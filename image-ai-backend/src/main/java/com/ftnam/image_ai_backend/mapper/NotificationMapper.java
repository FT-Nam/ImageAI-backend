package com.ftnam.image_ai_backend.mapper;

import com.ftnam.image_ai_backend.dto.request.NotificationCreationRequest;
import com.ftnam.image_ai_backend.dto.response.NotificationResponse;
import com.ftnam.image_ai_backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    Notification toNotification(NotificationCreationRequest request);

    @Mapping(source = "user.id", target = "userId")
    NotificationResponse toNotificationResponse(Notification notification);

}
