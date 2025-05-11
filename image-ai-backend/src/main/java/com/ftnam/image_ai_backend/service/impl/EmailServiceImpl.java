package com.ftnam.image_ai_backend.service.impl;

import com.ftnam.image_ai_backend.dto.request.email.EmailRequest;
import com.ftnam.image_ai_backend.dto.request.email.SendEmailRequest;
import com.ftnam.image_ai_backend.dto.request.email.Sender;
import com.ftnam.image_ai_backend.dto.response.EmailResponse;
import com.ftnam.image_ai_backend.exception.AppException;
import com.ftnam.image_ai_backend.exception.ErrorCode;
import com.ftnam.image_ai_backend.repository.httpclient.EmailClient;
import com.ftnam.image_ai_backend.service.EmailService;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailServiceImpl implements EmailService {
    EmailClient emailClient;

    @Value("${brevo.api-key}")
    @NonFinal
    String apiKey;

    @Override
    public EmailResponse sendEmail(SendEmailRequest request) {
        EmailRequest emailRequest = EmailRequest.builder()
                .sender(Sender.builder()
                        .email("ptnam1672003@gmail.com")
                        .name("imageai")
                        .build())
                .to(request.getTo())
                .htmlContent(request.getHtmlContent())
                .subject(request.getSubject())
                .build();

        try {
            return emailClient.sendEmail(apiKey, emailRequest);
        } catch (FeignException e){
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
