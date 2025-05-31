package com.example.PILL.dto.user;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResDto {

    private String usermadeId;

    private String userName;

    private String phoneNum;
}