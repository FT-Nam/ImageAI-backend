package com.ftnam.image_ai_backend.controller;

import com.ftnam.image_ai_backend.dto.request.email.EmailRequest;
import com.ftnam.image_ai_backend.dto.request.email.SendEmailRequest;
import com.ftnam.image_ai_backend.dto.response.ApiResponse;
import com.ftnam.image_ai_backend.dto.response.EmailResponse;
import com.ftnam.image_ai_backend.service.impl.EmailServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailController {
    EmailServiceImpl emailService;

    @PostMapping("/send")
    public ApiResponse<EmailResponse> sendEmail(@RequestBody SendEmailRequest request){
        return ApiResponse.<EmailResponse>builder()
                .value(emailService.sendEmail(request))
                .build();
    }
}
