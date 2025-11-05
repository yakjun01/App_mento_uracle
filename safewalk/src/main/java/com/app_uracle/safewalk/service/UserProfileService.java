package com.app_uracle.safewalk.service;

import com.app_uracle.safewalk.domain.GuardianInfo;
import com.app_uracle.safewalk.domain.UserProfile;
import com.app_uracle.safewalk.dto.ChangePasswordRequestDto;
import com.app_uracle.safewalk.dto.LoginRequestDto;
import com.app_uracle.safewalk.repository.GuardianInfoRepository;
import com.app_uracle.safewalk.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final GuardianInfoRepository guardianInfoRepository;

    @Transactional
    public UserProfile createUserProfile(UserProfile userProfile) {
        return userProfileRepository.save(userProfile);
    }

    public boolean checkEmailExists(String email) {
        return userProfileRepository.existsByEmail(email);
    }

    public UserProfile login(LoginRequestDto requestDto) {
        Optional<UserProfile> optionalUser = userProfileRepository.findByEmail(requestDto.getEmail());
        if (optionalUser.isPresent()) {
            UserProfile userProfile = optionalUser.get();
            if (userProfile.getPassWord().equals(requestDto.getPassword())) {
                return userProfile;
            }
        }
        return null;
    }

    @Transactional
    public void updateUserProfile(Long userId, UserProfile updatedProfile) {
        UserProfile existingProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user Id:" + userId));

        existingProfile.setName(updatedProfile.getName());
        existingProfile.setPhoneNumber(updatedProfile.getPhoneNumber());
        existingProfile.setBirthDay(updatedProfile.getBirthDay());
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setAddressDetail(updatedProfile.getAddressDetail());
        existingProfile.setBloodType(updatedProfile.getBloodType());
        existingProfile.setChronicIllness(updatedProfile.getChronicIllness());
        existingProfile.setMedicine(updatedProfile.getMedicine());
        existingProfile.setEtc(updatedProfile.getEtc());

        userProfileRepository.save(existingProfile);
    }

    public UserProfile findById(Long userId) {
        UserProfile userProfile = userProfileRepository.findById(userId).orElse(null);
        if (userProfile != null) {
            userProfile.getGuardians().size(); // Eagerly fetch guardians
        }
        return userProfile;
    }

    @Transactional
    public boolean changePassword(Long userId, ChangePasswordRequestDto requestDto) {
        if (!requestDto.getNewPassword().equals(requestDto.getConfirmPassword())) {
            return false;
        }

        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user Id:" + userId));

        if (!userProfile.getPassWord().equals(requestDto.getCurrentPassword())) {
            return false; // Current password does not match
        }

        userProfile.setPassWord(requestDto.getNewPassword());
        userProfileRepository.save(userProfile);

        return true;
    }

    @Transactional
    public boolean deleteUser(Long userId, String password) {
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user Id:" + userId));

        if (!userProfile.getPassWord().equals(password)) {
            return false; // Password does not match
        }

        userProfileRepository.delete(userProfile);
        return true;
    }

    @Transactional
    public void addGuardian(Long userId, GuardianInfo guardian) {
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user Id:" + userId));
        userProfile.getGuardians().add(guardian);
        guardian.setUser(userProfile);
    }

    @Transactional
    public void deleteGuardian(Long guardianId) {
        guardianInfoRepository.deleteById(guardianId);
    }
}