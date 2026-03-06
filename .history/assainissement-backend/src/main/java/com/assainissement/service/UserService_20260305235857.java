package com.assainissement.service;

import com.assainissement.dto.EmployeeDTO;
import com.assainissement.dto.UserDTO;
import com.assainissement.entity.Employee;
import com.assainissement.entity.User;
import com.assainissement.entity.UserRole;
import com.assainissement.repository.EmployeeRepository;
import com.assainissement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Transactional
    public User createUser(User user) {
        if (existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        // Create employee profile for WORKER and SUPERVISOR roles
        if (user.getRole() == UserRole.WORKER || user.getRole() == UserRole.SUPERVISOR) {
            Employee employee = Employee.builder()
                    .user(savedUser)
                    .employeeCode("EMP" + String.format("%05d", savedUser.getId()))
                    .totalPoints(0)
                    .monthlyPoints(0)
                    .totalMissionsCompleted(0)
                    .build();
            employeeRepository.save(employee);
        }
        
        return savedUser;
    }
    
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = findById(id);
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPhone(userDetails.getPhone());
        user.setProfilePhoto(userDetails.getProfilePhoto());
        return userRepository.save(user);
    }
    
    @Transactional
    public void deactivateUser(Long id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
    }
    
    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> findUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profilePhoto(user.getProfilePhoto())
                .role(user.getRole())
                .active(user.isActive())
                .online(user.isOnline())
                .lastSeenAt(user.getLastSeenAt())
                .fullName(user.getFullName())
                .build();
    }
    
    @Transactional
    public void setUserOnline(Long userId, boolean online) {
        User user = findById(userId);
        user.setOnline(online);
        user.setLastSeenAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }
    
    @Transactional
    public void setUserOnlineByEmail(String email, boolean online) {
        User user = findByEmail(email);
        user.setOnline(online);
        user.setLastSeenAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }
    
    public EmployeeDTO getEmployeeDTO(User user) {
        if (user.getRole() != UserRole.WORKER && user.getRole() != UserRole.SUPERVISOR) {
            return null;
        }
        Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
        if (employee == null) {
            return null;
        }
        return toEmployeeDTO(employee);
    }
    
    public EmployeeDTO toEmployeeDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .user(toDTO(employee.getUser()))
                .employeeCode(employee.getEmployeeCode())
                .hireDate(employee.getHireDate())
                .contractEndDate(employee.getContractEndDate())
                .contractType(employee.getContractType())
                .skills(employee.getSkills())
                .certifications(employee.getCertifications())
                .safetyTrainingCompleted(employee.isSafetyTrainingCompleted())
                .lastSafetyTrainingDate(employee.getLastSafetyTrainingDate())
                .currentLatitude(employee.getCurrentLatitude())
                .currentLongitude(employee.getCurrentLongitude())
                .currentAddress(employee.getCurrentAddress())
                .totalPoints(employee.getTotalPoints())
                .monthlyPoints(employee.getMonthlyPoints())
                .averageCompletionTime(employee.getAverageCompletionTime())
                .successRate(employee.getSuccessRate())
                .totalMissionsCompleted(employee.getTotalMissionsCompleted())
                .totalDistanceTraveled(employee.getTotalDistanceTraveled())
                .supervisorId(employee.getSupervisor() != null ? employee.getSupervisor().getId() : null)
                .supervisorName(employee.getSupervisor() != null ? employee.getSupervisor().getUser().getFullName() : null)
                .build();
    }
}
