package com.assainissement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mission_checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionChecklist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;
    
    @Column(nullable = false)
    private String item;
    
    private String description;
    
    private boolean completed;
    
    private boolean mandatory;
    
    private Integer orderIndex;
}
