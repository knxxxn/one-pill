package com.example.PILL.service;

import com.example.PILL.dto.CommonResDto;
import com.example.PILL.dto.user.*;
import com.example.PILL.entity.user.User;
import com.example.PILL.entity.user.UserHistory;
import com.example.PILL.repository.UserHistoryRepository;
import com.example.PILL.repository.UserRepository;
import com.example.PILL.util.AES256Util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserHistoryRepository userHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private AES256Util aes256Util;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsermadeId(username);
        if(user == null){
            throw new UsernameNotFoundException("사용자의 이름을 찾을 수 없습니다: " + username);
        }
        return user;
    }
    //AES 암호화 인코딩
    public String encryptUserData(String sensitiveData) {
        if (StringUtils.hasText(sensitiveData)) {
            try {
                log.info("인코딩 성공");
                return aes256Util.encode(sensitiveData);
            } catch (Exception e) {
                log.error("암호화 중 오류 발생: {}", e.getMessage());
                return sensitiveData;
            }
        }
        return sensitiveData;
    }
    //AES 암호화 디코딩
    public String decryptUserData(String encryptedData) {
        if (StringUtils.hasText(encryptedData)) {
            try {
                log.info("디코딩 성공");
                return aes256Util.decode(encryptedData);
            } catch (Exception e) {
                log.error("복호화 중 오류 발생: {}", e.getMessage());
                return encryptedData;
            }
        }
        return encryptedData;
    }
    /**
     * @MethodName registerUser
     * @MethodDec 회원 가입
     * @Date 2025.04.02
     * @Author nxxxn
     * @param requestDto 회원 가입 요청 DTO
     * @return 회원 가입 응답 DTO
     */
    @Transactional
    public CommonResDto registerUser(UserRegistReqDto requestDto) {
        log.info("[registerUser] START");

        Optional<User> existingUserByPhone = userRepository.findAll().stream()
                .filter(user -> decryptUserData(user.getPhoneNum()).equals(requestDto.getPhoneNum()))
                .findFirst(); //전화번호 복호화

        if (existingUserByPhone.isPresent()) {
            return new CommonResDto("1002", "이미 가입된 유저입니다", null);
        }

        if (userRepository.findFirstByUsermadeId(requestDto.getUsermadeId()) != null) {
            return new CommonResDto("1003", "이미 사용 중인 아이디입니다", null);
        }

        User user = User.builder()
                .usermadeId(requestDto.getUsermadeId())
                .userName(encryptUserData(requestDto.getUserName())) //AES 암호화
                .userPw(passwordEncoder.encode(requestDto.getUserPw())) //시큐리티 암호화
                .phoneNum(encryptUserData(requestDto.getPhoneNum())) //AES 암호화
                .build();

        userRepository.save(user);

        UserHistory userHistory = UserHistory.builder()
                .userId(user.getUserId())
                .usermadeId(user.getUsermadeId())
                .userName(user.getUserName())
                .userPw(user.getUserPw())
                .phoneNum(user.getPhoneNum())
                .hisType("회원가입")
                .hisDesc("신규")
                .build();

        userHistoryRepository.save(userHistory);

        log.info("[registerUser] SUCCESS userId: {}", user.getUserId());
        return new CommonResDto("1000", "회원 가입 성공", null);
    }
    /**
     * @MethodName loginUser
     * @MethodDec 회원 로그인
     * @Date 2025.04.02
     * @Author nxxxn
     * @param requestDto 회원 로그인 요청 DTO
     * @return 회원 로그인 응답 DTO
     */
    @Transactional
    public CommonResDto loginUser(UserLoginReqDto requestDto) {
        log.info("[loginUser] START");
        User user = userRepository.findFirstByUsermadeId(requestDto.getUsermadeId());

        if (user == null || !passwordEncoder.matches(requestDto.getUserPw(), user.getPassword())) {
            return new CommonResDto("1004", "아이디 또는 비밀번호가 일치하지 않습니다", null);
        }

        UserLoginResDto responseDto = UserLoginResDto.builder()
                .userId(user.getUserId())
                .usermadeId(user.getUsername())
                .userName(user.getUsername())
                .phoneNum(user.getPhoneNum())
                .build();

        log.info("[loginUser] SUCCESS userId: {}", user.getUserId());
        return new CommonResDto("1000", "로그인 성공", responseDto);
    }
    /**
     * @MethodName getUserInfo
     * @MethodDec 회원 정보 조회
     * @Date 2025.04.02
     * @Author nxxxn
     * @return 회원 정보 조회 응답 DTO
     */
    @Transactional
    public CommonResDto getUserInfo(String usermadeId) {
        log.info("[getUserInfo] START");
        User user = userRepository.findFirstByUsermadeId(usermadeId);
        if (user == null) {
            return new CommonResDto("1005", "유저 정보를 찾을 수 없습니다", null);
        }

        UserInfoResDto userInfoResDto = UserInfoResDto.builder()
                .usermadeId(user.getUsermadeId())
                .userName(decryptUserData(user.getUserName())) // AES 복호화
                .phoneNum(decryptUserData(user.getPhoneNum())) // AES 복호화
                .build();

        log.info("[getUserInfo] SUCCESS userId: {}", user.getUserId());
        return new CommonResDto("1000", "유저 정보 조회 성공", userInfoResDto);
    }
    /**
     * @MethodName modifyUser
     * @MethodDec 회원 정보 수정
     * @Date 2025.04.02
     * @Author nxxxn
     * @param requestDto 회원 정보 수정 요청 DTO
     * @return 회원 정보 수정 응답 DTO
     */
    @Transactional
    public CommonResDto modifyUser(String token, UserModifyReqDto requestDto) {
        log.info("[modifyUser] START");
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        String usermadeId = claims.getSubject(); // 토큰에서 사용자 아이디 추출

        User user = userRepository.findFirstByUsermadeId(usermadeId);

        if (user == null) {
            return new CommonResDto("1005", "유저 정보를 찾을 수 없습니다", null);
        }

        user.setUserPw(passwordEncoder.encode(requestDto.getUserPw()));
        user.setPhoneNum(encryptUserData(requestDto.getPhoneNum()));
        user.setUpdateAt(LocalDateTime.now());
        userRepository.save(user);

        UserHistory userHistory = UserHistory.builder()
                .userId(user.getUserId())
                .usermadeId(user.getUsermadeId())
                .userName(user.getUserName())
                .userPw(user.getUserPw())
                .phoneNum(user.getPhoneNum())
                .hisType("업데이트")
                .hisDesc("회원정보 수정")
                .build();

        userHistoryRepository.save(userHistory);

        UserInfoResDto userInfoResDto = UserInfoResDto.builder()
                .usermadeId(user.getUsermadeId())
                .userName(decryptUserData(user.getUserName()))
                .phoneNum(decryptUserData(user.getPhoneNum()))
                .build();

        log.info("[modifyUser] SUCCESS userId: {}", user.getUserId());
        return new CommonResDto("1000", "회원 정보 수정 성공", userInfoResDto);
    }
    /**
     * @MethodName deleteUser
     * @MethodDec 회원 탈퇴
     * @Date 2025.04.02
     * @Author nxxxn
     * @return 회원 탈퇴 응답 DTO
     */
    @Transactional
    public CommonResDto deleteUser(String token) {
        log.info("[deleteUser] START");
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        String usermadeId = claims.getSubject();

        User user = userRepository.findFirstByUsermadeId(usermadeId);

        if (user == null) {
            return new CommonResDto("1005", "유저 정보를 찾을 수 없습니다", null);
        }

        UserHistory userHistory = UserHistory.builder()
                .userId(user.getUserId())
                .usermadeId(user.getUsermadeId())
                .userName(user.getUserName())
                .userPw(user.getUserPw())
                .phoneNum(user.getPhoneNum())
                .hisType("회원 탈퇴")
                .hisDesc("회원 탈퇴")
                .build();

        userHistoryRepository.save(userHistory);
        userRepository.delete(user);

        log.info("[deleteUser] SUCCESS");
        return new CommonResDto("1000", "회원 탈퇴 성공", null);
    }

}