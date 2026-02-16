package com.assainissement.config;

import com.assainissement.entity.*;
import com.assainissement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final MissionRepository missionRepository;
    private final MissionChecklistRepository checklistRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            initializeData();
        }
    }
    
    private void initializeData() {
        log.info("Initializing sample data...");
        
        // Create Admin user
        User admin = userRepository.save(User.builder()
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
                .totalPoints(1250)
                .monthlyPoints(180)
                .totalMissionsCompleted(320)
                .successRate(96.5)
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
        
        Employee employee1 = employeeRepository.save(Employee.builder()
                .user(worker1)
                .employeeCode("EMP00002")
                .hireDate(LocalDate.of(2021, 3, 10))
                .contractType(ContractType.CDI)
                .skills(Arrays.asList("Curage", "Vidange", "Débouchage"))
                .certifications(Arrays.asList("Permis PL", "ADR"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 8, 15))
                .totalPoints(850)
                .monthlyPoints(125)
                .totalMissionsCompleted(195)
                .successRate(94.2)
                .supervisor(supervisorEmployee)
                .currentLatitude(48.8566)
                .currentLongitude(2.3522)
                .currentAddress("Paris, France")
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
        
        Employee employee2 = employeeRepository.save(Employee.builder()
                .user(worker2)
                .employeeCode("EMP00003")
                .hireDate(LocalDate.of(2022, 6, 20))
                .contractType(ContractType.CDI)
                .skills(Arrays.asList("Inspection caméra", "Diagnostic", "Hydrocurage"))
                .certifications(Arrays.asList("Permis B", "SST"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 5, 20))
                .totalPoints(620)
                .monthlyPoints(95)
                .totalMissionsCompleted(142)
                .successRate(91.8)
                .supervisor(supervisorEmployee)
                .currentLatitude(48.8606)
                .currentLongitude(2.3376)
                .currentAddress("Paris 1er, France")
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
        
        Employee employee3 = employeeRepository.save(Employee.builder()
                .user(worker3)
                .employeeCode("EMP00004")
                .hireDate(LocalDate.of(2023, 1, 5))
                .contractType(ContractType.CDD)
                .skills(Arrays.asList("Curage", "Pompage"))
                .certifications(Arrays.asList("Permis B"))
                .safetyTrainingCompleted(true)
                .lastSafetyTrainingDate(LocalDate.of(2025, 9, 10))
                .totalPoints(320)
                .monthlyPoints(65)
                .totalMissionsCompleted(78)
                .successRate(89.5)
                .supervisor(supervisorEmployee)
                .currentLatitude(48.8499)
                .currentLongitude(2.3412)
                .currentAddress("Paris 6ème, France")
                .build());
        
        // Create HR user
        User hr = userRepository.save(User.builder()
                .email("hr@assainissement.fr")
                .password(passwordEncoder.encode("hr123456"))
                .firstName("Sophie")
                .lastName("Leroy")
                .phone("+33 6 67 89 01 23")
                .role(UserRole.HR)
                .active(true)
                .build());
        
        // Create Employer user
        User employer = userRepository.save(User.builder()
                .email("employer@assainissement.fr")
                .password(passwordEncoder.encode("employer123"))
                .firstName("Marc")
                .lastName("Dubois")
                .phone("+33 6 78 90 12 34")
                .role(UserRole.EMPLOYER)
                .active(true)
                .build());
        
        // Create Clients
        Client client1 = clientRepository.save(Client.builder()
                .name("Mairie de Paris 15ème")
                .type(ClientType.MUNICIPALITE)
                .contactPerson("M. Robert")
                .email("contact@mairie15.paris.fr")
                .phone("+33 1 45 67 89 00")
                .address("31 Rue Péclet")
                .city("Paris")
                .postalCode("75015")
                .latitude(48.8416)
                .longitude(2.2992)
                .hasContract(true)
                .active(true)
                .build());
        
        Client client2 = clientRepository.save(Client.builder()
                .name("Restaurant Le Gourmet")
                .type(ClientType.ENTREPRISE)
                .contactPerson("M. Chef")
                .email("contact@legourmet.fr")
                .phone("+33 1 42 33 44 55")
                .address("12 Rue de la Paix")
                .city("Paris")
                .postalCode("75002")
                .latitude(48.8683)
                .longitude(2.3308)
                .hasContract(false)
                .active(true)
                .build());
        
        Client client3 = clientRepository.save(Client.builder()
                .name("Résidence Les Lilas")
                .type(ClientType.SYNDIC)
                .contactPerson("Mme Gestionnaire")
                .email("syndic@leslilas.fr")
                .phone("+33 1 48 55 66 77")
                .address("45 Avenue des Lilas")
                .city("Les Lilas")
                .postalCode("93260")
                .latitude(48.8797)
                .longitude(2.4168)
                .hasContract(true)
                .active(true)
                .build());
        
        // Create Missions
        Mission mission1 = missionRepository.save(Mission.builder()
                .title("Curage canalisation principale")
                .description("Curage préventif de la canalisation principale du bâtiment A. Accès par le parking souterrain.")
                .type(MissionType.CURAGE)
                .status(MissionStatus.ASSIGNED)
                .priority(MissionPriority.NORMAL)
                .clientName(client1.getName())
                .clientPhone(client1.getPhone())
                .clientEmail(client1.getEmail())
                .address(client1.getAddress())
                .city(client1.getCity())
                .postalCode(client1.getPostalCode())
                .latitude(client1.getLatitude())
                .longitude(client1.getLongitude())
                .zone("Paris 15")
                .scheduledStartTime(LocalDateTime.now().plusHours(2))
                .scheduledEndTime(LocalDateTime.now().plusHours(4))
                .estimatedDurationMinutes(120)
                .deadline(LocalDateTime.now().plusDays(1))
                .safetyInstructions("Port des EPI obligatoire. Attention à la circulation dans le parking.")
                .requiredEquipment(Arrays.asList("Camion hydrocureur", "Tuyaux HP", "EPI complet"))
                .assignedTo(employee1)
                .createdBy(supervisor)
                .build());
        
        // Add checklist items
        checklistRepository.saveAll(Arrays.asList(
            MissionChecklist.builder().mission(mission1).item("Vérifier l'accès au site").mandatory(true).orderIndex(1).build(),
            MissionChecklist.builder().mission(mission1).item("Installer la signalisation").mandatory(true).orderIndex(2).build(),
            MissionChecklist.builder().mission(mission1).item("Prendre photos AVANT").mandatory(true).orderIndex(3).build(),
            MissionChecklist.builder().mission(mission1).item("Réaliser le curage").mandatory(true).orderIndex(4).build(),
            MissionChecklist.builder().mission(mission1).item("Prendre photos APRÈS").mandatory(true).orderIndex(5).build(),
            MissionChecklist.builder().mission(mission1).item("Nettoyer la zone").mandatory(true).orderIndex(6).build(),
            MissionChecklist.builder().mission(mission1).item("Faire signer le client").mandatory(false).orderIndex(7).build()
        ));
        
        Mission mission2 = missionRepository.save(Mission.builder()
                .title("Vidange bac à graisse - Restaurant")
                .description("Vidange du bac à graisse du restaurant. Intervention en dehors des heures de service.")
                .type(MissionType.VIDANGE_BAC)
                .status(MissionStatus.ACCEPTED)
                .priority(MissionPriority.HIGH)
                .clientName(client2.getName())
                .clientPhone(client2.getPhone())
                .clientEmail(client2.getEmail())
                .address(client2.getAddress())
                .city(client2.getCity())
                .postalCode(client2.getPostalCode())
                .latitude(client2.getLatitude())
                .longitude(client2.getLongitude())
                .zone("Paris Centre")
                .scheduledStartTime(LocalDateTime.now().plusHours(5))
                .scheduledEndTime(LocalDateTime.now().plusHours(7))
                .estimatedDurationMinutes(90)
                .deadline(LocalDateTime.now().plusHours(8))
                .safetyInstructions("Attention aux sols glissants. Zone de cuisine - hygiène renforcée.")
                .requiredEquipment(Arrays.asList("Camion citerne", "Pompe", "Produit dégraissant"))
                .assignedTo(employee2)
                .createdBy(supervisor)
                .build());
        
        Mission mission3 = missionRepository.save(Mission.builder()
                .title("URGENT - Débouchage canalisation bouchée")
                .description("Canalisation principale bouchée. Risque de débordement imminent. Intervention urgente requise.")
                .type(MissionType.URGENCE_BOUCHAGE)
                .status(MissionStatus.ON_THE_WAY)
                .priority(MissionPriority.EMERGENCY)
                .clientName(client3.getName())
                .clientPhone(client3.getPhone())
                .clientEmail(client3.getEmail())
                .address(client3.getAddress())
                .city(client3.getCity())
                .postalCode(client3.getPostalCode())
                .latitude(client3.getLatitude())
                .longitude(client3.getLongitude())
                .zone("Les Lilas")
                .scheduledStartTime(LocalDateTime.now())
                .scheduledEndTime(LocalDateTime.now().plusHours(2))
                .estimatedDurationMinutes(90)
                .deadline(LocalDateTime.now().plusHours(3))
                .safetyInstructions("Urgence - Accès direct par le local technique RDC.")
                .requiredEquipment(Arrays.asList("Kit débouchage", "Caméra inspection", "Furet électrique"))
                .assignedTo(employee1)
                .createdBy(supervisor)
                .build());
        
        Mission mission4 = missionRepository.save(Mission.builder()
                .title("Inspection caméra réseau")
                .description("Inspection complète du réseau d'assainissement suite à des problèmes récurrents.")
                .type(MissionType.INSPECTION_CAMERA)
                .status(MissionStatus.CREATED)
                .priority(MissionPriority.NORMAL)
                .clientName(client1.getName())
                .clientPhone(client1.getPhone())
                .clientEmail(client1.getEmail())
                .address("15 Rue Lecourbe")
                .city("Paris")
                .postalCode("75015")
                .latitude(48.8445)
                .longitude(2.2985)
                .zone("Paris 15")
                .scheduledStartTime(LocalDateTime.now().plusDays(1).withHour(9))
                .scheduledEndTime(LocalDateTime.now().plusDays(1).withHour(12))
                .estimatedDurationMinutes(180)
                .deadline(LocalDateTime.now().plusDays(2))
                .safetyInstructions("Prévoir accès aux regards. Coordination avec services techniques mairie.")
                .requiredEquipment(Arrays.asList("Caméra motorisée", "Écran contrôle", "Trépied"))
                .createdBy(supervisor)
                .build());
        
        Mission mission5 = missionRepository.save(Mission.builder()
                .title("Maintenance préventive - Contrat annuel")
                .description("Intervention de maintenance préventive dans le cadre du contrat annuel.")
                .type(MissionType.MAINTENANCE_PREVENTIVE)
                .status(MissionStatus.COMPLETED)
                .priority(MissionPriority.LOW)
                .clientName(client3.getName())
                .clientPhone(client3.getPhone())
                .clientEmail(client3.getEmail())
                .address(client3.getAddress())
                .city(client3.getCity())
                .postalCode(client3.getPostalCode())
                .latitude(client3.getLatitude())
                .longitude(client3.getLongitude())
                .zone("Les Lilas")
                .scheduledStartTime(LocalDateTime.now().minusDays(1).withHour(14))
                .scheduledEndTime(LocalDateTime.now().minusDays(1).withHour(16))
                .actualStartTime(LocalDateTime.now().minusDays(1).withHour(14).withMinute(15))
                .actualEndTime(LocalDateTime.now().minusDays(1).withHour(16).withMinute(30))
                .actualDurationMinutes(135)
                .estimatedDurationMinutes(120)
                .deadline(LocalDateTime.now().minusDays(1).withHour(18))
                .assignedTo(employee3)
                .createdBy(supervisor)
                .aiConfidenceScore(87.5)
                .aiValidationNotes("OK: Before photos present (2). OK: After photos present (2). OK: GPS location consistent.")
                .aiApproved(false)
                .build());
        
        log.info("Sample data initialized successfully!");
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
