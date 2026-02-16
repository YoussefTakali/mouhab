package com.assainissement.entity;

public enum PointTransactionType {
    // Positive points
    ON_TIME_ARRIVAL(5, "Arrivée à l'heure"),
    TASK_COMPLETED(10, "Tâche complétée avec succès"),
    HIGH_AI_QUALITY_SCORE(5, "Score qualité AI élevé"),
    EMERGENCY_INTERVENTION(8, "Intervention d'urgence"),
    CLIENT_POSITIVE_FEEDBACK(10, "Retour client positif"),
    ZERO_REWORK(5, "Aucune reprise nécessaire"),
    PERFECT_WEEK(20, "Semaine parfaite"),
    TRAINING_COMPLETED(15, "Formation complétée"),
    MENTOR_BONUS(10, "Bonus mentorat"),
    
    // Negative points
    UNJUSTIFIED_ABSENCE(-20, "Absence injustifiée"),
    LATE_ARRIVAL(-5, "Arrivée en retard"),
    POOR_QUALITY_WORK(-10, "Travail de mauvaise qualité"),
    MISSING_PHOTOS(-15, "Photos manquantes"),
    TASK_REJECTED(-20, "Tâche rejetée"),
    SAFETY_VIOLATION(-25, "Violation de sécurité"),
    CLIENT_COMPLAINT(-15, "Plainte client"),
    SLA_BREACH(-10, "Dépassement SLA"),
    
    // Manual adjustment
    MANUAL_ADJUSTMENT(0, "Ajustement manuel");
    
    private final int defaultPoints;
    private final String displayName;
    
    PointTransactionType(int defaultPoints, String displayName) {
        this.defaultPoints = defaultPoints;
        this.displayName = displayName;
    }
    
    public int getDefaultPoints() {
        return defaultPoints;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
