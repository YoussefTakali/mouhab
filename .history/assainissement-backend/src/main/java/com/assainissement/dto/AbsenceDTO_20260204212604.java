package com.assainissement.dto;

import com.assainissement.entity.AbsenceStatus;
import com.assainissement.entity.AbsenceType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private AbsenceType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String notes;
    private AbsenceStatus status;
    private String documentPath;
    private Integer pointsPenalty;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
}
