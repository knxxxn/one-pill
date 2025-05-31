package com.example.PILL.entity.pill;

import com.example.PILL.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@Table(name = "TB_MYPILL")
public class MyPill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MYPILL_ID")
    private Long myPillId;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name = "item_Seq")
    private String itemSeq;

    @Column(name = "PILL_NAME")
    private String pillName;

    @Column(name = "PILL_DESC")
    private String pillDesc;

    @Column(name = "CREATE_AT")
    private LocalDateTime createAt;

    @Builder
    public MyPill(Long myPillId, User user, String itemSeq, String pillName, String pillDesc, LocalDateTime createAt) {
        this.myPillId = myPillId;
        this.user = user;
        this.itemSeq = itemSeq;
        this.pillName = pillName;
        this.pillDesc = pillDesc;
        this.createAt = createAt;
    }
}
