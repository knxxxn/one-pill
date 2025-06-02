package com.example.PILL.repository;

import com.example.PILL.entity.pill.AlarmPill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlarmPillRepository extends JpaRepository<AlarmPill, Long> {
    List<AlarmPill> findByAlarmTimeAndAlarmStatus(LocalDateTime alarmTime, int alarmStatus);

}
