package com.example.PILL.entity.pill;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Getter
@NoArgsConstructor
@Table(name = "TB_PERSCRIPTION_PERIOD")
public class PerscriptionPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PERSCRIPTION_PERIOD_ID")
    private Long perscriptionPeriodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PERSCRIPTION_ID")
    private Perscription perscription;

    @Column(name = "START_DATE")
    private LocalDateTime startDate;

    @Column(name = "END_DATE")
    private LocalDateTime endDate;

    @Column(name = "PERSCRIPTION_MEMO")
    private String perscriptionMemo;

    @Column(name = "CREATE_AT")
    private LocalDateTime createAt;

    @Builder
    public PerscriptionPeriod(Perscription perscription, LocalDateTime startDate, LocalDateTime endDate, String perscriptionMemo) {
        this.perscription = perscription;
        this.startDate = startDate;
        this.endDate = endDate;
        this.perscriptionMemo = perscriptionMemo;
        this.createAt = LocalDateTime.now();
    }
}