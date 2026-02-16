package com.assainissement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    // Mission stats
    private long totalMissions;
    private long completedMissions;
    private long pendingMissions;
    private long urgentMissions;
    private long overdueMissions;
    private double completionRate;
    
    // Employee stats
    private long totalEmployees;
    private long activeEmployees;
    private long employeesOnMission;
    
    // Today's stats
    private long todayMissions;
    private long todayCompleted;
    private long todayPending;
    
    // Weekly stats
    private long weeklyMissions;
    private long weeklyCompleted;
    
    // AI stats
    private long aiApprovedMissions;
    private long aiPendingReview;
    private double averageAiScore;
    
    // Points
    private int totalPointsAwarded;
    private int totalPointsDeducted;
}
