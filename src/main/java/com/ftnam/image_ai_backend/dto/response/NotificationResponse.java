package com.ftnam.image_ai_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;

    @JsonProperty("user_id")
    private String userId;

    String content;

    @JsonProperty("is_read")
    boolean isRead;

    @JsonProperty("created_at")
    LocalDateTime createdAt;
}
