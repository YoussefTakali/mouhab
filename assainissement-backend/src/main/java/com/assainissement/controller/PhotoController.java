package com.assainissement.controller;

import com.assainissement.dto.PhotoDTO;
import com.assainissement.entity.PhotoType;
import com.assainissement.entity.User;
import com.assainissement.service.PhotoService;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PhotoController {
    
    private final PhotoService photoService;
    private final UserService userService;
    
    @PostMapping("/upload")
    public ResponseEntity<PhotoDTO> uploadPhoto(
            @RequestParam Long missionId,
            @RequestParam MultipartFile file,
            @RequestParam PhotoType type,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String deviceModel,
            @RequestParam(defaultValue = "false") boolean fromGallery,
            Authentication authentication) throws IOException {

        User user = userService.findByEmail(authentication.getName());
        Long employeeId = userService.getEmployeeDTO(user) != null
            ? userService.getEmployeeDTO(user).getId()
            : null;
        
        return ResponseEntity.ok(photoService.uploadPhoto(
            missionId, employeeId, file, type, latitude, longitude, address, deviceId, deviceModel, fromGallery));
    }
    
    @GetMapping("/mission/{missionId}")
    public ResponseEntity<List<PhotoDTO>> getPhotosByMission(@PathVariable Long missionId) {
        return ResponseEntity.ok(photoService.getPhotosByMission(missionId));
    }
    
    @GetMapping("/mission/{missionId}/before")
    public ResponseEntity<List<PhotoDTO>> getBeforePhotos(@PathVariable Long missionId) {
        return ResponseEntity.ok(photoService.getBeforePhotos(missionId));
    }
    
    @GetMapping("/mission/{missionId}/after")
    public ResponseEntity<List<PhotoDTO>> getAfterPhotos(@PathVariable Long missionId) {
        return ResponseEntity.ok(photoService.getAfterPhotos(missionId));
    }
    
    @GetMapping("/{photoId}/content")
    public ResponseEntity<byte[]> getPhotoContent(@PathVariable Long photoId) throws IOException {
        byte[] content = photoService.getPhotoContent(photoId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(content);
    }
    
    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long photoId) throws IOException {
        photoService.deletePhoto(photoId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/mission/{missionId}/has-required")
    public ResponseEntity<Boolean> hasRequiredPhotos(@PathVariable Long missionId) {
        return ResponseEntity.ok(photoService.hasRequiredPhotos(missionId));
    }
}
