package com.example.PILL.config.user;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UserPwValidator implements ConstraintValidator<UserPw, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // null은 @NotBlank에서 처리
        }
        return value.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]{1,50}$");
        //소문자 대문자 숫자 특수기호 모두 포함하기
    }
}
