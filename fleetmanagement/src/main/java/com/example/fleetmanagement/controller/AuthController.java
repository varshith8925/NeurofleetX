package com.example.fleetmanagement.controller;

import com.example.fleetmanagement.model.User;
import com.example.fleetmanagement.model.Role;
import com.example.fleetmanagement.repository.UserRepository;
import com.example.fleetmanagement.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        // If role provided in login request, validate it matches stored user role
        Role requestedRole = request.getRole();
        if (requestedRole != null && user.getRole() != null) {
            if (!user.getRole().equals(requestedRole)) {
                throw new RuntimeException("Invalid Role");
            }
        }

        return user;
    }
}