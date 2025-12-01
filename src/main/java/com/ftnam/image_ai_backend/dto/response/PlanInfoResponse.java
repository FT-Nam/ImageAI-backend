package com.ftnam.image_ai_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ftnam.image_ai_backend.enums.SubscriptionPlan;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanInfoResponse {
    private String id;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscription;

    @JsonProperty("weekly_credit")
    private int weeklyCredit;

    private int price;
}
