package com.ftnam.image_ai_backend.listener;

import com.ftnam.image_ai_backend.dto.event.EmailEvent;
import com.ftnam.image_ai_backend.dto.request.email.Recipient;
import com.ftnam.image_ai_backend.dto.request.email.SendEmailRequest;
import com.ftnam.image_ai_backend.service.impl.EmailServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailDeliveryListener {

    EmailServiceImpl emailService;

    @KafkaListener(topics = "email-delivery")
    public void handleEmailDelivery(EmailEvent message){
        log.info("Message received: {}", message);
        emailService.sendEmail(SendEmailRequest.builder()
                        .to(Recipient.builder()
                                .email(message.getRecipient())
                                .build())
                        .templateId(message.getTemplateId())
                        .params(message.getParams())
                .build());
    }
}
