package com.example.PILL.entity.pill;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Entity
@Data
@NoArgsConstructor
@Table(name = "tb_alarm_pill")
public class AlarmPill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ALARM_ID")
    private Long alarmId;

    @ManyToOne
    @JoinColumn(name = "MYPILL_ID")
    private MyPill myPill;

    @Column(name = "ALARM_TIME")
    private LocalDateTime alarmTime;

    @Column(name = "ALARM_STATUS")
    private int alarmStatus;

    @Column(name = "CREATE_AT")
    private LocalDateTime createAt;

    @Builder
    public AlarmPill(Long alarmId, MyPill myPill, LocalDateTime alarmTime, int alarmStatus, LocalDateTime createAt) {
        this.alarmId = alarmId;
        this.myPill = myPill;
        this.alarmTime = alarmTime;
        this.alarmStatus = alarmStatus;
        this.createAt = createAt;
    }
}