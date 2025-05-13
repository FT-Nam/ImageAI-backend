package com.ftnam.image_ai_backend.repository;

import com.ftnam.image_ai_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, String> {
}
