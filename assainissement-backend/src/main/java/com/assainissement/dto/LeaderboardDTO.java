package com.assainissement.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardDTO {
    private List<LeaderboardEntryDTO> entries;
    private int totalEmployees;
    private String period; // "monthly", "yearly", "all-time"
}
