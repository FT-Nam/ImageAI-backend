package com.ftnam.image_ai_backend.dto.request.email;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendEmailRequest {
    List<Recipient> to;
    String htmlContent;
    String subject;
}
