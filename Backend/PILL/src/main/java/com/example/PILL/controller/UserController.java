package com.example.PILL.controller;

import com.example.PILL.config.jwt.JwtService;
import com.example.PILL.dto.CommonResDto;
import com.example.PILL.dto.user.UserLoginReqDto;
import com.example.PILL.dto.user.UserModifyReqDto;
import com.example.PILL.dto.user.UserRegistReqDto;
import com.example.PILL.entity.user.User;
import com.example.PILL.repository.UserRepository;
import com.example.PILL.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@RestControllerAdvice
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    //회원 가입
    @PostMapping("/regist")
    public ResponseEntity<CommonResDto> registerUser(@Valid @RequestBody UserRegistReqDto requestDto) {
        CommonResDto response = userService.registerUser(requestDto);
        return ResponseEntity.ok(response);
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<CommonResDto> login(@Valid @RequestBody UserLoginReqDto request) {
        User user = userRepository.findByUsermadeId(request.getUsermadeId());
        if (user == null || !passwordEncoder.matches(request.getUserPw(), user.getUserPw())) {
            return ResponseEntity.badRequest().body(new CommonResDto("1004", "아이디 또는 비밀번호가 일치하지 않습니다", null));
        }
        String jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(new CommonResDto("1000", "로그인 성공", jwtToken));
    }

    //회원 정보 조회
    @GetMapping("/info")
    public ResponseEntity<CommonResDto> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usermadeId = authentication.getName();

        CommonResDto response = userService.getUserInfo(usermadeId);
        return ResponseEntity.ok(response);
    }

    //회원 정보 수정
    @PostMapping("/modify")
    public CommonResDto modifyUser(@RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody UserModifyReqDto requestDto) {
        String token = authorizationHeader.substring(7);
        return userService.modifyUser(token, requestDto);
    }

    //회원 탈퇴
    @DeleteMapping("/delete")
    public CommonResDto deleteUser(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        return userService.deleteUser(token);
    }

    //유효성 검사시 발생하는 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResDto<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        BindingResult bindingResult = ex.getBindingResult();
        Map<String, String> errors = new HashMap<>();
        bindingResult.getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        CommonResDto<Map<String, String>> response = CommonResDto.<Map<String, String>>builder()
                .resultCd("1001")
                .resultMsg("필수값 누락")
                .contents(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
