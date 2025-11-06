package com.app_uracle.safewalk.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "pass_word", nullable = false)
    private String password;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "birth_day", nullable = false)
    private LocalDate birthDay;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "address_detail", nullable = false)
    private String addressDetail;

    @Column(name = "blood_type", nullable = false, length = 2)
    private String bloodType;

    @Column(name = "chronic_illness", columnDefinition = "TEXT")
    private String chronicIllness;

    @Column(name = "medicine", columnDefinition = "TEXT")
    private String medicine;

    @Column(name = "etc", columnDefinition = "TEXT")
    private String etc;

    @Column(name = "p_name", nullable = false, length = 100)
    private String pName;

    @Column(name = "relation", nullable = false, length = 50)
    private String relation;

    @Column(name = "p_phone_number", nullable = false, length = 20)
    private String pPhoneNumber;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<GuardianInfo> guardians = new ArrayList<>();

}