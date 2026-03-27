// backend/src/main/java/com/neurofleetx/dto/auth/SignupRequest.java
package com.neurofleetx.dto.auth;

import com.neurofleetx.enums.Gender;
import com.neurofleetx.enums.Role;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    private String licenseNumber;
    private String companyName;
    private String identityNumber;
    private String phone;
}