package com.ftnam.image_ai_backend.scheduler;

import com.ftnam.image_ai_backend.dto.event.NotificationEvent;
import com.ftnam.image_ai_backend.entity.PlanInfo;
import com.ftnam.image_ai_backend.entity.User;
import com.ftnam.image_ai_backend.enums.SubscriptionPlan;
import com.ftnam.image_ai_backend.exception.AppException;
import com.ftnam.image_ai_backend.exception.ErrorCode;
import com.ftnam.image_ai_backend.repository.PlanInfoRepository;
import com.ftnam.image_ai_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CreditResetScheduler {
    UserRepository userRepository;
    PlanInfoRepository planInfoRepository;

    KafkaTemplate<String,Object> kafkaTemplate;

    // Run in 00:00
    @Scheduled(cron = "0 0 0 * * *")
    public void resetWeeklyCredit(){
        List<User> users = userRepository.findAll();

        for(User user : users){
            boolean changed = false;
            LocalDateTime now = LocalDateTime.now();

            if(user.getSubscriptionExpiredAt() != null && now.isAfter(user.getSubscriptionExpiredAt())){
                user.setSubscriptionExpiredAt(null);
                user.setSubscription(SubscriptionPlan.FREE);
                user.setCreditResetAt(LocalDateTime.now());
                changed = true;

                NotificationEvent notificationEvent = NotificationEvent.builder()
                        .channel("EMAIL")
                        .recipient(user.getEmail())
                        .subject("⚠️ Gói dịch vụ của bạn đã hết hạn")
                        .body("Xin chào " + user.getName() + ",<br><br>"
                                + "Chúng tôi xin thông báo rằng gói dịch vụ <strong>" + user.getSubscription() + "</strong> của bạn tại ImageAI đã <strong>hết hạn</strong>.<br><br>"
                                + "Hiện tại, tài khoản của bạn đã tạm thời bị hạn chế một số tính năng nâng cao.<br><br>"
                                + "Để tiếp tục sử dụng đầy đủ các chức năng, vui lòng gia hạn gói dịch vụ của bạn.<br><br>"
                                + "👉 <a href=\"https://imageai.vn/renew\">Nhấn vào đây để gia hạn</a><br><br>"
                                + "Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với đội ngũ của chúng tôi.<br><br>"
                                + "Trân trọng,<br>"
                                + "Đội ngũ ImageAI")
                        .build();


                kafkaTemplate.send("email-delivery", notificationEvent);

                log.info("Subscription plan of user {} expired,reset free plan", user.getEmail());
            }

            boolean weeklyReset = Duration.between(user.getCreditResetAt(), now).toDays() >= 7;

            if (weeklyReset){
                PlanInfo planInfo = planInfoRepository.findBySubscription(user.getSubscription())
                        .orElseThrow(()-> new AppException(ErrorCode.SUBSCRIPTION_NOT_EXISTED));

                int newCredit = Math.min((user.getCredit() + planInfo.getWeeklyCredit()), 5000);

                user.setCredit(newCredit);
                user.setCreditResetAt(LocalDateTime.now());
                changed = true;
                log.info("Reset credit of user {} sccessfully", user.getEmail());
            }

            if (changed) {
                userRepository.save(user);
            }
        }
    }
}
