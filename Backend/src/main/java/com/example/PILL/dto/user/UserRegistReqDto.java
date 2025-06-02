package com.example.PILL.dto.user;

import com.example.PILL.config.user.PhoneNumber;
import com.example.PILL.config.user.UserPw;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegistReqDto {

    @NotBlank(message = "아이디를 입력해주세요")
    private String usermadeId;

    @NotBlank(message = "이름을 입력해주세요")
    private String userName;

    @UserPw
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String userPw;

    @PhoneNumber
    @NotBlank(message = "전화번호를 입력해주세요")
    private String phoneNum;
}