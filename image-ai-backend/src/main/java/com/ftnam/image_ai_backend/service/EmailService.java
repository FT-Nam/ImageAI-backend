package com.ftnam.image_ai_backend.service;

import com.ftnam.image_ai_backend.dto.request.email.EmailRequest;
import com.ftnam.image_ai_backend.dto.request.email.SendEmailRequest;
import com.ftnam.image_ai_backend.dto.response.EmailResponse;

public interface EmailService {
    EmailResponse sendEmail(SendEmailRequest request);
}
