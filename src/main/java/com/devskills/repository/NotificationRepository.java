package com.devskills.repository;

import com.devskills.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDeveloperIdOrderByCreatedAtDesc(String developerId);
    List<Notification> findByDeveloperIdAndIsReadFalseOrderByCreatedAtDesc(String developerId);
}
