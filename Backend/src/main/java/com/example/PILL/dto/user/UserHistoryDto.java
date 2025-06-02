package com.example.PILL.dto.user;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserHistoryDto {

    private String userId;

    private String UserMadeId;

    private String userName;

    private String userPw;

    private String PhoneNum;


}
