package com.app_uracle.safewalk.repository;

import com.app_uracle.safewalk.domain.GuardianInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardianInfoRepository extends JpaRepository<GuardianInfo, Long> {
    List<GuardianInfo> findByUserId(Long userId);
}
