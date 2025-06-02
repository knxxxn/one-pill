package com.example.PILL.dto.user;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserLoginResDto {

    private String userId;

    private String usermadeId;

    private String userName;

    private String phoneNum;
}