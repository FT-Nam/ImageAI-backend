package com.ftnam.image_ai_backend.repository.httpclient;

import com.ftnam.image_ai_backend.dto.request.email.EmailRequest;
import com.ftnam.image_ai_backend.dto.response.EmailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "email-client", url = "https://api.brevo.com")
public interface EmailClient {
    @PostMapping(value = "/v3/smtp/email", consumes = MediaType.APPLICATION_JSON_VALUE)
    EmailResponse sendEmail(@RequestHeader("api-key") String apiKey, @RequestBody EmailRequest request);
}
