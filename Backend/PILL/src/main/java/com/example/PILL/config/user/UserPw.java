package com.example.PILL.config.user;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = UserPwValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface UserPw {

    String message() default "유효하지 않은 비밀번호 형식입니다 \n 대/소문자, 숫자, 특수문자를 포함해주세요";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
