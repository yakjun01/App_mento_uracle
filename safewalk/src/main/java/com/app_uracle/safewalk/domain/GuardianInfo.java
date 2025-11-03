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

    @Column(name = "guardianName", nullable = false, length = 100)
    private String guardianName;

    @Column(name = "guardianRelation", nullable = false, length = 50)
    private String guardianRelation;

    @Column(name = "guardianPhoneNumber", nullable = false, length = 20)
    private String guardianPhoneNumber;
}
