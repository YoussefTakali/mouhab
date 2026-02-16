package com.assainissement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionChecklistDTO {
    private Long id;
    private String item;
    private String description;
    private boolean completed;
    private boolean mandatory;
    private Integer orderIndex;
}
