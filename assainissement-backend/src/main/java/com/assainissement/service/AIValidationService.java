package com.assainissement.service;

import com.assainissement.entity.Mission;
import com.assainissement.entity.Photo;
import com.assainissement.entity.PhotoType;
import com.assainissement.repository.MissionRepository;
import com.assainissement.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

/**
 * AI Validation Service - Mock implementation
 * In a real scenario, this would integrate with an actual AI/ML service
 * for image analysis and quality detection.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIValidationService {
    
    private final PhotoRepository photoRepository;
    private final MissionRepository missionRepository;
    
    private final Random random = new Random();
    
    /**
     * Validates a completed mission using AI analysis
     * Mock implementation that simulates AI scoring
     */
    @Transactional
    public void validateMission(Mission mission) {
        log.info("Starting AI validation for mission: {}", mission.getId());
        
        List<Photo> beforePhotos = photoRepository.findBeforePhotosByMission(mission.getId());
        List<Photo> afterPhotos = photoRepository.findAfterPhotosByMission(mission.getId());
        
        // Check if required photos are present
        boolean hasBeforePhotos = !beforePhotos.isEmpty();
        boolean hasAfterPhotos = !afterPhotos.isEmpty();
        
        double confidenceScore = 0.0;
        StringBuilder notes = new StringBuilder();
        
        if (!hasBeforePhotos) {
            notes.append("MISSING: Before photos required. ");
            confidenceScore -= 30;
        } else {
            notes.append("OK: Before photos present (").append(beforePhotos.size()).append("). ");
            confidenceScore += 25;
        }
        
        if (!hasAfterPhotos) {
            notes.append("MISSING: After photos required. ");
            confidenceScore -= 30;
        } else {
            notes.append("OK: After photos present (").append(afterPhotos.size()).append("). ");
            confidenceScore += 25;
        }
        
        // Analyze individual photos (mock)
        double avgPhotoScore = analyzePhotos(beforePhotos, afterPhotos);
        confidenceScore += avgPhotoScore;
        
        // Check for GPS consistency
        boolean gpsValid = validateGPSConsistency(mission, beforePhotos, afterPhotos);
        if (gpsValid) {
            notes.append("OK: GPS location consistent. ");
            confidenceScore += 15;
        } else {
            notes.append("WARNING: GPS location inconsistent. ");
            confidenceScore -= 10;
        }
        
        // Check for fraud indicators
        boolean fraudDetected = checkForFraud(beforePhotos, afterPhotos);
        if (fraudDetected) {
            notes.append("ALERT: Potential fraud detected. ");
            confidenceScore -= 40;
        }
        
        // Normalize score to 0-100
        confidenceScore = Math.max(0, Math.min(100, confidenceScore + 50));
        
        // Determine if auto-approved
        boolean autoApproved = confidenceScore >= 90;
        
        mission.setAiConfidenceScore(confidenceScore);
        mission.setAiValidationNotes(notes.toString());
        mission.setAiApproved(autoApproved);
        
        missionRepository.save(mission);
        
        log.info("AI validation complete for mission {}: score={}, autoApproved={}", 
                mission.getId(), confidenceScore, autoApproved);
    }
    
    /**
     * Analyze individual photos (mock implementation)
     */
    private double analyzePhotos(List<Photo> beforePhotos, List<Photo> afterPhotos) {
        double totalScore = 0;
        int count = 0;
        
        for (Photo photo : beforePhotos) {
            double score = analyzePhoto(photo);
            photo.setAiQualityScore(score);
            photo.setValidated(score >= 60);
            photoRepository.save(photo);
            totalScore += score;
            count++;
        }
        
        for (Photo photo : afterPhotos) {
            double score = analyzePhoto(photo);
            photo.setAiQualityScore(score);
            photo.setValidated(score >= 60);
            photoRepository.save(photo);
            totalScore += score;
            count++;
        }
        
        // Compare before and after (mock - check if they're different)
        if (!beforePhotos.isEmpty() && !afterPhotos.isEmpty()) {
            boolean showsChange = detectChange(beforePhotos, afterPhotos);
            if (showsChange) {
                totalScore += 15;
            }
        }
        
        return count > 0 ? (totalScore / count) * 0.35 : 0;
    }
    
    /**
     * Analyze a single photo (mock implementation)
     * In reality, this would use computer vision to detect:
     * - Image quality (blur, lighting)
     * - Content relevance (pipes, drains, etc.)
     * - Manipulation detection
     */
    private double analyzePhoto(Photo photo) {
        StringBuilder analysis = new StringBuilder();
        double score = 70 + random.nextDouble() * 30; // Base score 70-100
        
        // Check if from gallery (fraud indicator)
        if (photo.isFromGallery()) {
            score -= 50;
            analysis.append("Photo uploaded from gallery - suspicious. ");
            photo.setAiDetectedFraud(true);
        }
        
        // Check GPS data
        if (photo.getLatitude() == null || photo.getLongitude() == null) {
            score -= 10;
            analysis.append("No GPS data. ");
        }
        
        // Mock image quality check
        boolean isBlurry = random.nextDouble() < 0.1; // 10% chance of blur
        if (isBlurry) {
            score -= 15;
            analysis.append("Image appears blurry. ");
        }
        
        photo.setAiAnalysisNotes(analysis.toString());
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * Validate GPS consistency between mission location and photos
     */
    private boolean validateGPSConsistency(Mission mission, List<Photo> beforePhotos, List<Photo> afterPhotos) {
        if (mission.getLatitude() == null || mission.getLongitude() == null) {
            return true; // Can't validate if no mission coordinates
        }
        
        double missionLat = mission.getLatitude();
        double missionLng = mission.getLongitude();
        double tolerance = 0.01; // About 1km
        
        for (Photo photo : beforePhotos) {
            if (photo.getLatitude() != null && photo.getLongitude() != null) {
                double distance = calculateDistance(missionLat, missionLng, 
                        photo.getLatitude(), photo.getLongitude());
                if (distance > tolerance) {
                    return false;
                }
            }
        }
        
        for (Photo photo : afterPhotos) {
            if (photo.getLatitude() != null && photo.getLongitude() != null) {
                double distance = calculateDistance(missionLat, missionLng, 
                        photo.getLatitude(), photo.getLongitude());
                if (distance > tolerance) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Check for fraud indicators (mock implementation)
     */
    private boolean checkForFraud(List<Photo> beforePhotos, List<Photo> afterPhotos) {
        // Check if any photos uploaded from gallery
        for (Photo photo : beforePhotos) {
            if (photo.isFromGallery()) return true;
        }
        for (Photo photo : afterPhotos) {
            if (photo.isFromGallery()) return true;
        }
        
        // Mock check for reused photos (would use image hashing in reality)
        return random.nextDouble() < 0.05; // 5% random fraud detection for demo
    }
    
    /**
     * Detect if before/after photos show actual change (mock)
     */
    private boolean detectChange(List<Photo> beforePhotos, List<Photo> afterPhotos) {
        // In reality, would use image comparison algorithms
        return random.nextDouble() > 0.1; // 90% chance of detecting change
    }
    
    /**
     * Calculate distance between two GPS coordinates
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
    }
}
