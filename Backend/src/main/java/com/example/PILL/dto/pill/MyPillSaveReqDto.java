package com.example.PILL.dto.pill;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MyPillSaveReqDto {

    @NotBlank(message = "품번을 입력하세요")
    private String itemSeq;

    @NotBlank(message = "약 약칭을 입력해주세요")
    private String pillName;

    @NotBlank(message = "약에 대한 설명을 입력해주세요")
    private String pillDesc;
}
