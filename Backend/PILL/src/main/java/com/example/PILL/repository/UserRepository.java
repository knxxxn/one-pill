package com.example.PILL.repository;

import com.example.PILL.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    User findByUsermadeId(String usermadeId);
    User findFirstByUsermadeId(String usermadeId);
}
