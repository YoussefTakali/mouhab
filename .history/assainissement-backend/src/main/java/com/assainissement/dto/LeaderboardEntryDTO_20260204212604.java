package com.assainissement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryDTO {
    private int rank;
    private Long employeeId;
    private String employeeName;
    private String profilePhoto;
    private int points;
    private int missionsCompleted;
    private double successRate;
    private String badge; // gold, silver, bronze, none
}
