package com.ftnam.image_ai_backend.controller;

import com.ftnam.image_ai_backend.dto.response.ApiResponse;
import com.ftnam.image_ai_backend.dto.response.NotificationResponse;
import com.ftnam.image_ai_backend.service.impl.NotificationServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class NotificationController {
    NotificationServiceImpl notificationService;

    @GetMapping("/{userId}")
    ApiResponse<List<NotificationResponse>> getNotificationsByUser(@PathVariable String userId){
        return ApiResponse.<List<NotificationResponse>>builder()
                .value(notificationService.getNotificationsByUser(userId))
                .build();
    }

    @PutMapping("/{id}")
    ApiResponse<NotificationResponse> updateIsRead(@PathVariable String id){
        return ApiResponse.<NotificationResponse>builder()
                .value(notificationService.updateNotification(id))
                .message("Notice has been read")
                .build();
    }
}
