package com.app_uracle.safewalk.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "user_guardian")
public class GuardianInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserProfile user;

    @Column(name = "guardian_name", nullable = false, length = 100)
    private String name;

    @Column(name = "guardian_relation", nullable = false, length = 50)
    private String relation;

    @Column(name = "guardian_phone_number", nullable = false, length = 20)
    private String phoneNumber;
}
