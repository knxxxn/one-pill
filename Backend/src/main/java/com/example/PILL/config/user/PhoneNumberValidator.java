package com.example.PILL.config.user;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // null은 @NotBlank에서 처리
        }
        return value.matches("^01(?:0|1|[6-9])-(?:\\d{3,4})-\\d{4}$");
        //010-0000-0000 형식
    }
}