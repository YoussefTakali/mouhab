package com.assainissement.dto;

import com.assainissement.entity.PointTransactionType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransactionDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long missionId;
    private String missionTitle;
    private Integer points;
    private PointTransactionType type;
    private String reason;
    private String description;
    private LocalDateTime createdAt;
}
