package com.app_uracle.safewalk.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupStep1RequestDto {
    private String username;
    private String email;
    private String password;
}
