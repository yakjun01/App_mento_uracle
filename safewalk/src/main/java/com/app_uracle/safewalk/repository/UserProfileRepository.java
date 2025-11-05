package com.app_uracle.safewalk.repository;

import com.app_uracle.safewalk.domain.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByEmail(String email);
    Optional<UserProfile> findByEmail(String email);
}
