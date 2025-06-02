package com.example.PILL.repository;

import com.example.PILL.entity.pill.PerscriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerscriptionItemRepository extends JpaRepository<PerscriptionItem, Integer> {
    List<PerscriptionItem> findByPerscription_PerscriptionId(Long perscriptionId);
}