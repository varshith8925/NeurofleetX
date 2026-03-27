// backend/src/main/java/com/neurofleetx/service/UserService.java
package com.neurofleetx.service;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.dto.auth.UserDTO;
import com.neurofleetx.entity.User;
import com.neurofleetx.enums.Role;
import com.neurofleetx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public ApiResponse<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(users);
    }

    public ApiResponse<List<UserDTO>> getUsersByRole(Role role) {
        List<UserDTO> users = userRepository.findByRole(role).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(users);
    }

    public ApiResponse<List<UserDTO>> getDrivers() {
        return getUsersByRole(Role.DRIVER);
    }

    public ApiResponse<List<UserDTO>> getAvailableDrivers() {
        List<UserDTO> drivers = userRepository.findByRoleAndAvailableTrue(Role.DRIVER).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(drivers);
    }

    public ApiResponse<List<UserDTO>> getManagers() {
        return getUsersByRole(Role.FLEET_MANAGER);
    }

    public ApiResponse<List<UserDTO>> getCustomers() {
        return getUsersByRole(Role.CUSTOMER);
    }

    public ApiResponse<UserDTO> getUserById(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ApiResponse.error("User not found");
        }
        return ApiResponse.success(mapToDTO(user));
    }

    public ApiResponse<UserDTO> updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ApiResponse.error("User not found");
        }

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setLicenseNumber(userDTO.getLicenseNumber());
        user.setCompanyName(userDTO.getCompanyName());
        user.setIdentityNumber(userDTO.getIdentityNumber());
        user.setPhone(userDTO.getPhone());

        userRepository.save(user);
        return ApiResponse.success(mapToDTO(user));
    }

    public ApiResponse<Void> deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return ApiResponse.error("User not found");
        }
        userRepository.deleteById(id);
        return ApiResponse.success("User deleted successfully", null);
    }

    public ApiResponse<StatsDTO> getUserStats() {
        StatsDTO stats = StatsDTO.builder()
                .drivers(userRepository.countByRole(Role.DRIVER))
                .managers(userRepository.countByRole(Role.FLEET_MANAGER))
                .customers(userRepository.countByRole(Role.CUSTOMER))
                .build();
        return ApiResponse.success(stats);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
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
    }
}