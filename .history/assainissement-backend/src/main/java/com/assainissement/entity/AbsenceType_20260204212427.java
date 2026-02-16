package com.assainissement.entity;

public enum AbsenceType {
    CONGE_PAYE("Congé payé"),
    CONGE_SANS_SOLDE("Congé sans solde"),
    RTT("RTT"),
    MALADIE("Arrêt maladie"),
    MALADIE_PROFESSIONNELLE("Maladie professionnelle"),
    ACCIDENT_TRAVAIL("Accident de travail"),
    MATERNITE("Congé maternité"),
    PATERNITE("Congé paternité"),
    FORMATION("Formation"),
    ABSENCE_JUSTIFIEE("Absence justifiée"),
    ABSENCE_INJUSTIFIEE("Absence injustifiée"),
    CONGE_EXCEPTIONNEL("Congé exceptionnel"),
    TELETRAVAIL("Télétravail"),
    OTHER("Autre");
    
    private final String displayName;
    
    AbsenceType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
