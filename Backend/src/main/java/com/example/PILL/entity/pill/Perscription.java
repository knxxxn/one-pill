package com.example.PILL.entity.pill;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Data
@NoArgsConstructor
@Getter
@Table(name = "TB_PERSCRIPTION")
public class Perscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PERSCRIPTION_ID")
    private Long perscriptionId;

    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "PERSCRIPTION_IMAGE")
    private String perscriptionImage;

    @Column(name = "CREATE_AT")
    private LocalDateTime createAt;

    @Transient // 데이터베이스에 매핑하지 않음
    private List<String> medicineNames;

    public void setMedicineNames(List<String> medicineNames) {
        this.medicineNames = medicineNames;
    }

    @Builder
    public Perscription(String userId, String perscriptionImage) {
        this.userId = userId;
        this.perscriptionImage = perscriptionImage;
        this.createAt = LocalDateTime.now();
    }
}