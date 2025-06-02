package com.example.PILL.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CommonResDto<T> {
    @JsonProperty("ResultCd")
    private String resultCd;

    @JsonProperty("ResultMsg")
    private String resultMsg;

    @JsonInclude(JsonInclude.Include.NON_NULL) //null이면 값이 반환되지 않음
    @JsonProperty("Contents")
    private T contents;

    public CommonResDto(String resultCd, String resultMsg, T contents) {
        this.resultCd = resultCd;
        this.resultMsg = resultMsg;
        this.contents = contents;
    }

    public CommonResDto(){};
}