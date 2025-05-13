package com.ftnam.image_ai_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "Notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id")
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    String content;

    @Column(name = "is_read")
    boolean isRead;

    @Column(name = "created_at")
    @CreationTimestamp
    LocalDateTime createdAt;
}
