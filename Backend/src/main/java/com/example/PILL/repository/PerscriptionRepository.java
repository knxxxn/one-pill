package com.example.PILL.repository;

import com.example.PILL.entity.pill.Perscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PerscriptionRepository extends JpaRepository<Perscription, Long> {
    List<Perscription> findByUserId(String userId);
    Optional<Perscription> findByPerscriptionId(Long perscriptionId);
    List<Perscription> findByUserIdAndCreateAtBetween(String userId, LocalDateTime startDate, LocalDateTime endDate);
    List<Perscription> findByUserIdAndCreateAtAfter(String userId, LocalDateTime startDate);
    List<Perscription> findByUserIdAndCreateAtBefore(String userId, LocalDateTime endDate);
}