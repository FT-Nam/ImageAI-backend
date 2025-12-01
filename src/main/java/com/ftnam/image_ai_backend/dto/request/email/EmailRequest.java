package com.ftnam.image_ai_backend.dto.request.email;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmailRequest {
    Sender sender;

    List<Recipient> to;

    String subject;

    String htmlContent;

    int templateId;

    Map<String, String> params;
}
