package com.assainissement.controller;

import com.assainissement.dto.*;
import com.assainissement.entity.User;
import com.assainissement.entity.UserRole;
import com.assainissement.security.JwtTokenProvider;
import com.assainissement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userService.findByEmail(request.getEmail());
        
        // Set user as online
        userService.setUserOnlineByEmail(request.getEmail(), true);
        user = userService.findByEmail(request.getEmail()); // Refresh to get updated status
        
        UserDTO userDTO = userService.toDTO(user);
        EmployeeDTO employeeDTO = userService.getEmployeeDTO(user);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userDTO)
                .employee(employeeDTO)
                .build());
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : UserRole.WORKER)
                .active(true)
                .build();
        
        User savedUser = userService.createUser(user);
        String jwt = tokenProvider.generateToken(savedUser.getEmail());
        
        UserDTO userDTO = userService.toDTO(savedUser);
        EmployeeDTO employeeDTO = userService.getEmployeeDTO(savedUser);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userDTO)
                .employee(employeeDTO)
                .build());
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.findByEmail(email);
        UserDTO userDTO = userService.toDTO(user);
        EmployeeDTO employeeDTO = userService.getEmployeeDTO(user);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .user(userDTO)
                .employee(employeeDTO)
                .build());
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            try {
                userService.setUserOnlineByEmail(authentication.getName(), false);
            } catch (Exception e) {
                // User might not exist, ignore
            }
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().body(java.util.Map.of("message", "Logged out successfully"));
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "New passwords do not match"));
        }
        
        try {
            userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok().body(java.util.Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
