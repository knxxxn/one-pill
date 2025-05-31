package com.example.PILL.entity.pill;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_PERSCRIPTION_ITEM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PerscriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRESCRIPTION_ITEM_ID")
    private Integer perscriptionItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRESCRIPTION_ID")
    private Perscription perscription;

    @Lob
    @Column(name = "PRESCRIPTION_RESULT", nullable = false)
    private byte[] perscriptionResult;
}