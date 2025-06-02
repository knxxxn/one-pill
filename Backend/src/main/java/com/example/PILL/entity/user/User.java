package com.example.PILL.entity.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "TB_USERS")
public class User implements UserDetails {

    @Id
    @Column(name = "USER_ID", length = 60, nullable = false)
    private String userId; //자동 생성되는 유저 아이디

    @Column(name = "USERMADE_ID", length = 50, nullable = false, unique = true)
    private String usermadeId; //유저가 만든 아이디

    @Column(name = "USER_NAME", length = 50, nullable = false)
    private String userName; //유저 이름

    @Column(name = "USER_PW", length = 200, nullable = false)
    private String userPw; // 유저 비밀번호

    @Column(name = "PHONENUM", length = 200, nullable = false, unique = true)
    private String phoneNum; // 유저 핸드폰 번호

    @Column(name = "CREATE_AT", nullable = false)
    private LocalDateTime createAt; //가입 날짜

    @Column(name = "UPDATE_AT", nullable = false)
    private LocalDateTime updateAt; //업데이트 날짜

    @Builder
    public User(String usermadeId, String userName, String userPw, String phoneNum) {
        this.userId = generateUserId();
        this.usermadeId = usermadeId;
        this.userName = userName;
        this.userPw = userPw;
        this.phoneNum = phoneNum;
        this.createAt = LocalDateTime.now();
        this.updateAt = LocalDateTime.now();
    }

    private String generateUserId() {
        return UUID.randomUUID().toString();
    }

    public void updateUser(String userPw, String phoneNum) {
        this.userPw = userPw;
        this.phoneNum = phoneNum;
        this.updateAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // 사용자의 권한 목록 반환
    }

    @Override
    public String getPassword() {return userPw;}

    @Override
    public String getUsername() {return usermadeId;}

    public String getUserName() {return userName;}

}
