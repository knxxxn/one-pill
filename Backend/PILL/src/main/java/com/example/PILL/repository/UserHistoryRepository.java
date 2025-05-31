package com.example.PILL.repository;

import com.example.PILL.entity.user.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserHistoryRepository extends JpaRepository<UserHistory, Long> {

}