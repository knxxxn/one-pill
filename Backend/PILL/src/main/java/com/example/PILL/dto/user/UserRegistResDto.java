package com.example.PILL.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserRegistResDto {

    private String userId;

    private String UserMadeId;

    private String userName;

    private String userPw;

    private String PhoneNum;
}
