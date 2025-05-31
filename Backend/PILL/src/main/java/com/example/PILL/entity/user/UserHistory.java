package com.example.PILL.entity.user;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "TB_USERS_HISTORY")
public class UserHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HIS_ID")
    private Long hisId; //유저 이력 아이디

    @Column(name = "USER_ID", length = 60, nullable = false)
    private String userId; //자동 생성된 유저 아이디

    @Column(name = "USERMADE_ID", length = 50, nullable = false, unique = true)
    private String usermadeId; //유저가 만든 아이디

    @Column(name = "USER_NAME", length = 50, nullable = false)
    private String userName; //유저 이름

    @Column(name = "USER_PW", length = 200, nullable = false)
    private String userPw; //유저 비밀번호

    @Column(name = "PHONENUM", length = 200, nullable = false, unique = true)
    private String phoneNum; //유저 핸드폰 번호

    @Column(name = "HIS_TYPE", length = 20)
    private String hisType; // 활동 유형

    @Column(name = "HIS_DESC", length = 100)
    private String hisDesc; //활동 상세

    @Column(name = "CREATE_AT", nullable = false)
    private LocalDateTime createAt; //업데이트 일시

    @Builder
    public UserHistory(String userId, String usermadeId, String userName, String userPw, String phoneNum, String hisType, String hisDesc) {
        this.userId = userId;
        this.usermadeId = usermadeId;
        this.userName = userName;
        this.userPw = userPw;
        this.phoneNum = phoneNum;
        this.hisType = hisType;
        this.hisDesc = hisDesc;
        this.createAt = LocalDateTime.now();
    }
}
