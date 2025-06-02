package com.example.PILL.repository;

import com.example.PILL.entity.pill.PerscriptionPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PerscriptionPeriodRepository extends JpaRepository<PerscriptionPeriod, Long> {
    Optional<PerscriptionPeriod> findTopByPerscription_PerscriptionIdOrderByCreateAtDesc(Long perscriptionId);
}