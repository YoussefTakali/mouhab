package com.assainissement.config;

import com.assainissement.entity.User;
import com.assainissement.entity.UserRole;
import com.assainissement.repository.UserRepository;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
        private final UserService userService;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            initializeAccounts();
        }
    }
    
    private void initializeAccounts() {
        log.info("Initializing demo accounts...");
        
        // Create Admin user
        userService.createUser(User.builder()
                .email("admin@assainissement.fr")
                .password("admin123")
                .firstName("Jean")
                .lastName("Dupont")
                .phone("+33 6 12 34 56 78")
                .role(UserRole.ADMIN)
                .active(true)
                .build());
        
        // Create Supervisor user
        userService.createUser(User.builder()
                .email("supervisor@assainissement.fr")
                .password("super123")
                .firstName("Marie")
                .lastName("Martin")
                .phone("+33 6 23 45 67 89")
                .role(UserRole.SUPERVISOR)
                .active(true)
                .build());
        
        // Create Workers
        userService.createUser(User.builder()
                .email("worker1@assainissement.fr")
                .password("worker123")
                .firstName("Pierre")
                .lastName("Bernard")
                .phone("+33 6 34 56 78 90")
                .role(UserRole.WORKER)
                .active(true)
                .build());

        userService.createUser(User.builder()
                .email("worker2@assainissement.fr")
                .password("worker123")
                .firstName("Lucas")
                .lastName("Petit")
                .phone("+33 6 45 67 89 01")
                .role(UserRole.WORKER)
                .active(true)
                .build());

        userService.createUser(User.builder()
                .email("worker3@assainissement.fr")
                .password("worker123")
                .firstName("Antoine")
                .lastName("Moreau")
                .phone("+33 6 56 78 90 12")
                .role(UserRole.WORKER)
                .active(true)
                .build());
        
        // Create HR user
        userService.createUser(User.builder()
                .email("hr@assainissement.fr")
                .password("hr123456")
                .firstName("Sophie")
                .lastName("Leroy")
                .phone("+33 6 67 89 01 23")
                .role(UserRole.HR)
                .active(true)
                .build());
        
        // Create Employer user
        userService.createUser(User.builder()
                .email("employer@assainissement.fr")
                .password("employer123")
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
