// backend/src/main/java/com/neurofleetx/dto/auth/AuthResponse.java
package com.neurofleetx.dto.auth;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private UserDTO user;
}