// backend/src/main/java/com/neurofleetx/controller/UserController.java
package com.neurofleetx.controller;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.dto.auth.UserDTO;
import com.neurofleetx.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
    
    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getDrivers() {
        return ResponseEntity.ok(userService.getDrivers());
    }
    
    @GetMapping("/drivers/available")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAvailableDrivers() {
        return ResponseEntity.ok(userService.getAvailableDrivers());
    }
    
    @GetMapping("/managers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getManagers() {
        return ResponseEntity.ok(userService.getManagers());
    }
    
    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getCustomers() {
        return ResponseEntity.ok(userService.getCustomers());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatsDTO>> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }
}