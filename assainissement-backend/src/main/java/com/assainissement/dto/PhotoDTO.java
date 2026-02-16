package com.assainissement.dto;

import com.assainissement.entity.PhotoType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoDTO {
    private Long id;
    private Long missionId;
    private String fileName;
    private String filePath;
    private String originalFileName;
    private Long fileSize;
    private String mimeType;
    private PhotoType type;
    private Double latitude;
    private Double longitude;
    private String capturedAddress;
    private LocalDateTime capturedAt;
    private String deviceId;
    private boolean fromGallery;
    private Double aiQualityScore;
    private String aiAnalysisNotes;
    private boolean aiDetectedFraud;
    private boolean validated;
    private LocalDateTime createdAt;
}
