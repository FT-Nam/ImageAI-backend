package com.ftnam.image_ai_backend.dto.request.email;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendEmailRequest {
    Recipient to;
    String htmlContent;
    String subject;
    Map<String,String> params;
    int templateId;
}
