package com.assainissement.dto;

import com.assainissement.entity.UserRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profilePhoto;
    private UserRole role;
    private boolean active;
    private boolean online;
    private java.time.LocalDateTime lastSeenAt;
    private String fullName;
}
