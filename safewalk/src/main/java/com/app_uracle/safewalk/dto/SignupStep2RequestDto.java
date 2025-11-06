package com.app_uracle.safewalk.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class SignupStep2RequestDto {

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthdate;

    private String phone;
    private String address;
    private String addressDetail;
    private String bloodType;
    private String medicalCondition;
    private String medication;
    private String otherNotes;
}
