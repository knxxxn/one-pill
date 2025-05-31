package com.example.PILL.dto.pill;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AlarmReqDto {

    @NotBlank(message = "약 아이디를 입력하세요")
    private Long myPillId;

    @NotBlank(message = "시간을 입력하세요")
    private int alarmMinutes;
}
