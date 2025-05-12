package com.ftnam.image_ai_backend.dto.request.email;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailRequest {
    @JsonProperty("sender")
    Sender sender;

    @JsonProperty("to")
    List<Recipient> to;

    @JsonProperty("subject")
    String subject;

    @JsonProperty("htmlContent")
    String htmlContent;
}
