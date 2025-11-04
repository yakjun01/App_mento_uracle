package com.app_uracle.safewalk.controller;

import com.app_uracle.safewalk.domain.GuardianInfo;
import com.app_uracle.safewalk.domain.UserProfile;
import com.app_uracle.safewalk.dto.AddContactRequestDto;
import com.app_uracle.safewalk.dto.ChangePasswordRequestDto;
import com.app_uracle.safewalk.dto.DeleteAccountRequestDto;
import com.app_uracle.safewalk.dto.LoginRequestDto;
import com.app_uracle.safewalk.dto.SignupStep1RequestDto;
import com.app_uracle.safewalk.dto.SignupStep2RequestDto;
import com.app_uracle.safewalk.dto.SignupStep3RequestDto;
import com.app_uracle.safewalk.service.UserProfileService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final UserProfileService userProfileService;

    @GetMapping("/")
    public String root() {
        return "index";
    }

    @PostMapping("/login")
    public String login(@ModelAttribute LoginRequestDto requestDto, HttpSession session, RedirectAttributes redirectAttributes) {
        UserProfile user = userProfileService.login(requestDto);
        if (user != null) {
            session.setAttribute("loggedInUser", user);
            return "redirect:/main";
        } else {
            redirectAttributes.addFlashAttribute("error", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "redirect:/";
        }
    }

    @GetMapping("/main")
    public String mainPage(HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/";
        }
        return "main";
    }

    @GetMapping("/my-info")
    public String myInfoPage(HttpSession session, Model model) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }
        model.addAttribute("userProfile", loggedInUser);
        return "my-info";
    }

    @GetMapping("/emergency-contacts")
    public String emergencyContactsPage(HttpSession session, Model model) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }
        UserProfile freshUserProfile = userProfileService.findById(loggedInUser.getId());
        session.setAttribute("loggedInUser", freshUserProfile);
        model.addAttribute("userProfile", freshUserProfile);
        return "emergency-contacts";
    }

    @GetMapping("/settings")
    public String settingsPage(HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/";
        }
        return "settings";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @GetMapping("/edit-contacts")
    public String editContactsPage(HttpSession session, Model model) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }
        UserProfile freshUserProfile = userProfileService.findById(loggedInUser.getId());
        session.setAttribute("loggedInUser", freshUserProfile);
        model.addAttribute("userProfile", freshUserProfile);
        return "edit-contacts";
    }

    @GetMapping("/add-contact")
    public String addContactPage(HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/";
        }
        return "add-contact";
    }

    @PostMapping("/add-contact")
    public String processAddContact(@ModelAttribute AddContactRequestDto requestDto, HttpSession session) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }

        GuardianInfo newGuardian = new GuardianInfo();
        newGuardian.setGuardianName(requestDto.getName());
        newGuardian.setGuardianRelation(requestDto.getRelationship());
        newGuardian.setGuardianPhoneNumber(requestDto.getPhone());

        userProfileService.addGuardian(loggedInUser.getId(), newGuardian);

        return "redirect:/emergency-contacts";
    }

    @PostMapping("/delete-guardian/{id}")
    public String deleteGuardian(@PathVariable Long id, HttpSession session) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }
        userProfileService.deleteGuardian(id);
        return "redirect:/edit-contacts";
    }

    @GetMapping("/edit-info")
    public String editInfoPage(HttpSession session, Model model) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/";
        }
        model.addAttribute("userProfile", session.getAttribute("loggedInUser"));
        return "edit-info";
    }

    @PostMapping("/edit-info")
    public String processEditInfo(@ModelAttribute("userProfile") UserProfile updatedProfile, HttpSession session) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }

        if (!loggedInUser.getId().equals(updatedProfile.getId())) {
            return "redirect:/logout";
        }

        userProfileService.updateUserProfile(loggedInUser.getId(), updatedProfile);

        session.setAttribute("loggedInUser", userProfileService.findById(loggedInUser.getId()));

        return "redirect:/my-info";
    }

    @GetMapping("/change-password")
    public String changePasswordPage(HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/";
        }
        return "change-password";
    }

    @PostMapping("/change-password")
    public String processChangePassword(@ModelAttribute ChangePasswordRequestDto requestDto, HttpSession session, RedirectAttributes redirectAttributes) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }

        boolean success = userProfileService.changePassword(loggedInUser.getId(), requestDto);

        if (success) {
            session.invalidate();
            return "redirect:/";
        } else {
            redirectAttributes.addFlashAttribute("error", "현재 비밀번호가 올바르지 않거나, 새 비밀번호가 일치하지 않습니다.");
            return "redirect:/change-password";
        }
    }

    @GetMapping("/delete-account")
    public String deleteAccountPage(HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/";
        }
        return "delete-account";
    }

    @PostMapping("/delete-account")
    public String processDeleteAccount(@ModelAttribute DeleteAccountRequestDto requestDto, HttpSession session, RedirectAttributes redirectAttributes) {
        UserProfile loggedInUser = (UserProfile) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/";
        }

        boolean success = userProfileService.deleteUser(loggedInUser.getId(), requestDto.getPassword());

        if (success) {
            session.invalidate();
            return "redirect:/";
        } else {
            redirectAttributes.addFlashAttribute("error", "비밀번호가 올바르지 않습니다.");
            return "redirect:/delete-account";
        }
    }

    @GetMapping("/signup-cancel")
    public String signupCancel(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @GetMapping("/signup-step1")
    public String signupStep1(HttpSession session, Model model) {
        UserProfile userProfile = (UserProfile) session.getAttribute("userProfile");
        if (userProfile != null) {
            model.addAttribute("userProfile", userProfile);
        } else {
            model.addAttribute("userProfile", new UserProfile());
        }
        return "signup-step1";
    }

    @PostMapping("/check-email")
    @ResponseBody
    public Map<String, Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userProfileService.checkEmailExists(email);
        return Map.of("exists", exists);
    }

    @PostMapping("/signup-step1")
    public String processSignupStep1(@ModelAttribute SignupStep1RequestDto requestDto, HttpSession session) {
        UserProfile userProfile = (UserProfile) session.getAttribute("userProfile");
        if (userProfile == null) {
            userProfile = new UserProfile();
        }
        userProfile.setName(requestDto.getUsername());
        userProfile.setEmail(requestDto.getEmail());
        userProfile.setPassWord(requestDto.getPassword());
        session.setAttribute("userProfile", userProfile);
        return "redirect:/signup-step2";
    }

    @GetMapping("/signup-step2")
    public String signupStep2(HttpSession session, Model model) {
        UserProfile userProfile = (UserProfile) session.getAttribute("userProfile");
        if (userProfile == null) {
            return "redirect:/signup-step1";
        }
        model.addAttribute("userProfile", userProfile);
        return "signup-step2";
    }

    @PostMapping("/signup-step2")
    public String processSignupStep2(@ModelAttribute SignupStep2RequestDto requestDto, HttpSession session) {
        UserProfile userProfile = (UserProfile) session.getAttribute("userProfile");
        if (userProfile == null) {
            return "redirect:/signup-step1";
        }
        userProfile.setBirthDay(requestDto.getBirthdate());
        userProfile.setPhoneNumber(requestDto.getPhone());
        userProfile.setAddress(requestDto.getAddress());
        userProfile.setAddressDetail(requestDto.getAddressDetail());
        userProfile.setBloodType(requestDto.getBloodType());
        userProfile.setChronicIllness(requestDto.getMedicalCondition());
        userProfile.setMedicine(requestDto.getMedication());
        userProfile.setEtc(requestDto.getOtherNotes());

        session.setAttribute("userProfile", userProfile);
        return "redirect:/signup-step3";
    }

    @GetMapping("/signup-step3")
    public String signupStep3(HttpSession session, Model model) {
        UserProfile userProfile = (UserProfile) session.getAttribute("userProfile");
        if (userProfile == null) {
            return "redirect:/signup-step1";
        }
        model.addAttribute("userProfile", userProfile);
        return "signup-step3";
    }

    @PostMapping("/signup-step3")
    public String processSignupStep3(@ModelAttribute SignupStep3RequestDto requestDto, HttpSession session) {
        UserProfile userProfile = (UserProfile) session.getAttribute("userProfile");
        if (userProfile == null) {
            return "redirect:/signup-step1";
        }

        userProfile.setPName(requestDto.getPName());
        userProfile.setRelation(requestDto.getRelation());
        userProfile.setPPhoneNumber(requestDto.getPPhoneNumber());

        userProfileService.createUserProfile(userProfile);

        session.invalidate();

        return "redirect:/";
    }
}
