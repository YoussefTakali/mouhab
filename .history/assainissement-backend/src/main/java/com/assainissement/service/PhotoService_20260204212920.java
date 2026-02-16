package com.assainissement.service;

import com.assainissement.dto.PhotoDTO;
import com.assainissement.entity.Mission;
import com.assainissement.entity.Photo;
import com.assainissement.entity.PhotoType;
import com.assainissement.repository.MissionRepository;
import com.assainissement.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoService {
    
    private final PhotoRepository photoRepository;
    private final MissionRepository missionRepository;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    
    @Transactional
    public PhotoDTO uploadPhoto(Long missionId, MultipartFile file, PhotoType type,
                                 Double latitude, Double longitude, String address,
                                 String deviceId, String deviceModel, boolean fromGallery) throws IOException {
        
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "missions", missionId.toString());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
        String newFilename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);
        
        // Create photo record
        Photo photo = Photo.builder()
                .mission(mission)
                .fileName(newFilename)
                .filePath(filePath.toString())
                .originalFileName(originalFilename)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .type(type)
                .latitude(latitude)
                .longitude(longitude)
                .capturedAddress(address)
                .capturedAt(LocalDateTime.now())
                .deviceId(deviceId)
                .deviceModel(deviceModel)
                .fromGallery(fromGallery)
                .validated(false)
                .build();
        
        Photo savedPhoto = photoRepository.save(photo);
        
        log.info("Photo uploaded for mission {}: {} (type: {})", missionId, newFilename, type);
        
        return toDTO(savedPhoto);
    }
    
    public List<PhotoDTO> getPhotosByMission(Long missionId) {
        return photoRepository.findByMissionId(missionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PhotoDTO> getBeforePhotos(Long missionId) {
        return photoRepository.findBeforePhotosByMission(missionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PhotoDTO> getAfterPhotos(Long missionId) {
        return photoRepository.findAfterPhotosByMission(missionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public byte[] getPhotoContent(Long photoId) throws IOException {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found"));
        
        Path filePath = Paths.get(photo.getFilePath());
        return Files.readAllBytes(filePath);
    }
    
    @Transactional
    public void deletePhoto(Long photoId) throws IOException {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found"));
        
        // Delete file
        Path filePath = Paths.get(photo.getFilePath());
        Files.deleteIfExists(filePath);
        
        // Delete record
        photoRepository.delete(photo);
    }
    
    public boolean hasRequiredPhotos(Long missionId) {
        Long beforeCount = photoRepository.countPhotosByMissionAndType(missionId, PhotoType.BEFORE);
        Long afterCount = photoRepository.countPhotosByMissionAndType(missionId, PhotoType.AFTER);
        return beforeCount > 0 && afterCount > 0;
    }
    
    private PhotoDTO toDTO(Photo photo) {
        return PhotoDTO.builder()
                .id(photo.getId())
                .missionId(photo.getMission().getId())
                .fileName(photo.getFileName())
                .filePath("/api/photos/" + photo.getId() + "/content")
                .originalFileName(photo.getOriginalFileName())
                .fileSize(photo.getFileSize())
                .mimeType(photo.getMimeType())
                .type(photo.getType())
                .latitude(photo.getLatitude())
                .longitude(photo.getLongitude())
                .capturedAddress(photo.getCapturedAddress())
                .capturedAt(photo.getCapturedAt())
                .deviceId(photo.getDeviceId())
                .fromGallery(photo.isFromGallery())
                .aiQualityScore(photo.getAiQualityScore())
                .aiAnalysisNotes(photo.getAiAnalysisNotes())
                .aiDetectedFraud(photo.isAiDetectedFraud())
                .validated(photo.isValidated())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}
