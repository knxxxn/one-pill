package com.example.PILL.dto.pill;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class PerscriptionPeriodReqDto {

    private Long perscriptionId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String perscriptionMemo;
}
