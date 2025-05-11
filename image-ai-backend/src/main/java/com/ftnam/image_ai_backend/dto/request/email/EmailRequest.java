package com.ftnam.image_ai_backend.dto.request.email;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    Sender sender;
    List<Recipient> to;
    String htmlContent;
    String subject;
}
