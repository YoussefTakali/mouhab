package com.assainissement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String filePath;
    
    private String originalFileName;
    
    private Long fileSize;
    
    private String mimeType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhotoType type;
    
    // GPS info
    private Double latitude;
    private Double longitude;
    private String capturedAddress;
    
    // Timestamp
    @Column(nullable = false)
    private LocalDateTime capturedAt;
    
    // Device info for fraud prevention
    private String deviceId;
    private String deviceModel;
    
    // Flag if uploaded from gallery (should be rejected)
    private boolean fromGallery;
    
    // AI Analysis
    private Double aiQualityScore;
    private String aiAnalysisNotes;
    private boolean aiDetectedFraud;
    private String aiDetectedIssues;
    
    // Is this photo valid
    private boolean validated;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (capturedAt == null) {
            capturedAt = LocalDateTime.now();
        }
    }
}
