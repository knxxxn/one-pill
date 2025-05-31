package com.example.PILL.repository;

import com.example.PILL.entity.pill.MyPill;
import com.example.PILL.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MyPillRepository extends JpaRepository<MyPill, Long> {
    List<MyPill> findByUser(User user);
    Optional<MyPill> findByUserAndItemSeq(User user, String itemSeq);
}