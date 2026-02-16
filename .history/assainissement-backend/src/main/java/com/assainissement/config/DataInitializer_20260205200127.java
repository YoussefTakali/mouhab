package com.assainissement.config;

import com.assainissement.entity.*;
import com.assainissement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            initializeAccounts();
        }
    }
    
    private void initializeAccounts() {
        log.info("Initializing demo accounts...");
        
        // Create Admin user
        userRepository.save(User.builder()
                .email("admin@assainissement.fr")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Jean")
                .lastName("Dupont")
                .phone("+33 6 12 34 56 78")
                .role(UserRole.ADMIN)
                .active(true)
                .build());
        
        // Create Supervisor user
        User supervisor = userRepository.save(User.builder()
                .email("supervisor@assainissement.fr")
                .password(passwordEncoder.encode("super123"))
                .firstName("Marie")
                .lastName("Martin")
                .phone("+33 6 23 45 67 89")
                .role(UserRole.SUPERVISOR)
                .active(true)
                .build());
        
        Employee supervisorEmployee = employeeRepository.save(Employee.builder()
                .user(supervisor)
                .employeeCode("EMP00001")
                .hireDate(LocalDate.of(2020, 1, 15))
                .contractType(ContractType.CDI)
                .skills(Arrays.asList("Curage", "Inspection caméra", "Management"))
                .certifications(Arrays.asList("Habilitation électrique", "CACES"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 6, 1))
                .totalPoints(0)
                .monthlyPoints(0)
                .totalMissionsCompleted(0)
                .successRate(0.0)
                .build());
        
        // Create Workers
        User worker1 = userRepository.save(User.builder()
                .email("worker1@assainissement.fr")
                .password(passwordEncoder.encode("worker123"))
                .firstName("Pierre")
                .lastName("Bernard")
                .phone("+33 6 34 56 78 90")
                .role(UserRole.WORKER)
                .active(true)
                .build());
        
        employeeRepository.save(Employee.builder()
                .user(worker1)
                .employeeCode("EMP00002")
                .hireDate(LocalDate.of(2021, 3, 10))
                .contractType(ContractType.CDI)
                .skills(Arrays.asList("Curage", "Vidange", "Débouchage"))
                .certifications(Arrays.asList("Permis PL", "ADR"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 8, 15))
                .totalPoints(0)
                .monthlyPoints(0)
                .totalMissionsCompleted(0)
                .successRate(0.0)
                .supervisor(supervisorEmployee)
                .build());
        
        User worker2 = userRepository.save(User.builder()
                .email("worker2@assainissement.fr")
                .password(passwordEncoder.encode("worker123"))
                .firstName("Lucas")
                .lastName("Petit")
                .phone("+33 6 45 67 89 01")
                .role(UserRole.WORKER)
                .active(true)
                .build());
        
        employeeRepository.save(Employee.builder()
                .user(worker2)
                .employeeCode("EMP00003")
                .hireDate(LocalDate.of(2022, 6, 20))
                .contractType(ContractType.CDI)
                .skills(Arrays.asList("Inspection caméra", "Diagnostic", "Hydrocurage"))
                .certifications(Arrays.asList("Permis B", "SST"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 5, 20))
                .totalPoints(0)
                .monthlyPoints(0)
                .totalMissionsCompleted(0)
                .successRate(0.0)
                .supervisor(supervisorEmployee)
                .build());
        
        User worker3 = userRepository.save(User.builder()
                .email("worker3@assainissement.fr")
                .password(passwordEncoder.encode("worker123"))
                .firstName("Antoine")
                .lastName("Moreau")
                .phone("+33 6 56 78 90 12")
                .role(UserRole.WORKER)
                .active(true)
                .build());
        
        employeeRepository.save(Employee.builder()
                .user(worker3)
                .employeeCode("EMP00004")
                .hireDate(LocalDate.of(2023, 1, 5))
                .contractType(ContractType.CDD)
                .skills(Arrays.asList("Curage", "Pompage"))
                .certifications(Arrays.asList("Permis B"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 9, 10))
                .totalPoints(0)
                .monthlyPoints(0)
                .totalMissionsCompleted(0)
                .successRate(0.0)
                .supervisor(supervisorEmployee)
                .build());
        
        // Create HR user
        userRepository.save(User.builder()
                .email("hr@assainissement.fr")
                .password(passwordEncoder.encode("hr123456"))
                .firstName("Sophie")
                .lastName("Leroy")
                .phone("+33 6 67 89 01 23")
                .role(UserRole.HR)
                .active(true)
                .build());
        
        // Create Employer user
        userRepository.save(User.builder()
                .email("employer@assainissement.fr")
                .password(passwordEncoder.encode("employer123"))
                .firstName("Marc")
                .lastName("Dubois")
                .phone("+33 6 78 90 12 34")
                .role(UserRole.EMPLOYER)
                .active(true)
                .build());
        
        log.info("Demo accounts initialized successfully!");
        log.info("===========================================");
        log.info("Test accounts created:");
        log.info("  Admin:      admin@assainissement.fr / admin123");
        log.info("  Supervisor: supervisor@assainissement.fr / super123");
        log.info("  Worker 1:   worker1@assainissement.fr / worker123");
        log.info("  Worker 2:   worker2@assainissement.fr / worker123");
        log.info("  Worker 3:   worker3@assainissement.fr / worker123");
        log.info("  HR:         hr@assainissement.fr / hr123456");
        log.info("  Employer:   employer@assainissement.fr / employer123");
        log.info("===========================================");
    }
}
