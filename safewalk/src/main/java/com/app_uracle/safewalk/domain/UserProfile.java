package com.app_uracle.safewalk.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "user_profile")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "passWord", nullable = false)
    private String passWord;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "birthDay", nullable = false)
    private LocalDate birthDay;

    @Column(name = "phoneNumber", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "addressDetail", nullable = false)
    private String addressDetail;

    @Column(name = "bloodType", nullable = false, length = 2)
    private String bloodType;

    @Column(name = "chronicIllness", columnDefinition = "TEXT")
    private String chronicIllness;

    @Column(name = "medicine", columnDefinition = "TEXT")
    private String medicine;

    @Column(name = "etc", columnDefinition = "TEXT")
    private String etc;

    @Column(name = "pName", nullable = false, length = 100)
    private String pName;

    @Column(name = "relation", nullable = false, length = 50)
    private String relation;

    @Column(name = "pPhoneNumber", nullable = false, length = 20)
    private String pPhoneNumber;

}