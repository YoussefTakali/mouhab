package com.assainissement.entity;

public enum MissionStatus {
    CREATED,            // Mission créée
    ASSIGNED,           // Assignée à un technicien
    ACCEPTED,           // Acceptée par le technicien
    ON_THE_WAY,         // En route
    ON_SITE,            // Sur site
    IN_PROGRESS,        // En cours d'exécution
    COMPLETED,          // Terminée (en attente validation)
    PENDING_REVIEW,     // En attente de révision superviseur
    APPROVED,           // Approuvée
    REJECTED,           // Rejetée
    CANCELLED,          // Annulée
    ON_HOLD             // En pause
}
