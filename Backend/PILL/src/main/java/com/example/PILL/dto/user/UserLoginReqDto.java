package com.example.PILL.dto.user;

import com.example.PILL.config.user.UserPw;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginReqDto {

    @NotBlank(message = "아이디를 입력해주세요")
    private String usermadeId;

    @UserPw
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String userPw;
}