package com.example.PILL.dto.pill;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PerscriptionPeriodResDto {

    private Long perscriptionPeriodId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String perscriptionMemo;
}
