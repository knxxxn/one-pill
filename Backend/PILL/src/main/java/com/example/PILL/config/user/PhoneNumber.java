package com.example.PILL.config.user;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PhoneNumberValidator.class) //사용자 정의 제약 조건 어노테이션 정의. validatedby를 통해 제약 조건의 유효성 검사를 하는 클래스 정의
@Target({ElementType.FIELD}) //어노테이션이 적용회는 유형 지정
@Retention(RetentionPolicy.RUNTIME) //어노테이션 정보가 런타임까지 유지되도록 지정
public @interface PhoneNumber {

    String message() default "유효하지 않은 휴대폰 번호 형식입니다";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
