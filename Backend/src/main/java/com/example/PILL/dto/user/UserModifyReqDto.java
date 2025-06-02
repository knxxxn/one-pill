package com.example.PILL.dto.user;

import com.example.PILL.config.user.PhoneNumber;
import com.example.PILL.config.user.UserPw;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserModifyReqDto {

    @UserPw
    @NotBlank(message = "새로운 비밀번호를 입력해주세요")
    private String userPw;

    @PhoneNumber
    @NotBlank(message = "새로운 전화번호를 입력해주세요")
    private String phoneNum;
}