// backend/src/main/java/com/neurofleetx/dto/auth/UserDTO.java
package com.neurofleetx.dto.auth;

import com.neurofleetx.enums.Gender;
import com.neurofleetx.enums.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Gender gender;
    private Role role;
    private String licenseNumber;
    private String companyName;
    private String identityNumber;
    private String phone;
    private Boolean available;
}