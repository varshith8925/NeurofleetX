// backend/src/main/java/com/neurofleetx/service/AuthService.java
package com.neurofleetx.service;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.auth.*;
import com.neurofleetx.entity.User;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.security.CustomUserDetails;
import com.neurofleetx.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public ApiResponse<AuthResponse> signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email already registered");
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .gender(request.getGender())
                .role(request.getRole())
                .licenseNumber(request.getLicenseNumber())
                .companyName(request.getCompanyName())
                .identityNumber(request.getIdentityNumber())
                .phone(request.getPhone())
                .available(true)
                .build();
        
        userRepository.save(user);
        
        return ApiResponse.success("User registered successfully", null);
    }
    
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            return ApiResponse.error("Invalid email or password");
        }
        
        User user = userRepository.findByEmailAndRole(request.getEmail(), request.getRole())
                .orElse(null);
        
        if (user == null) {
            return ApiResponse.error("User not found with specified role");
        }
        
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);
        
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .gender(user.getGender())
                .role(user.getRole())
                .licenseNumber(user.getLicenseNumber())
                .companyName(user.getCompanyName())
                .identityNumber(user.getIdentityNumber())
                .phone(user.getPhone())
                .available(user.getAvailable())
                .build();
        
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(userDTO)
                .build();
        
        return ApiResponse.success(response);
    }
}