package com.assainissement.entity;

public enum MissionType {
    CURAGE("Curage et nettoyage des canalisations"),
    VIDANGE_FOSSE("Vidange fosses septiques"),
    VIDANGE_BAC("Vidange bacs à graisse"),
    INSPECTION_CAMERA("Inspection caméra"),
    INSPECTION_REGARD("Inspection regards"),
    INSPECTION_RESEAU("Inspection réseaux"),
    URGENCE_BOUCHAGE("Intervention urgente - Bouchage"),
    URGENCE_DEBORDEMENT("Intervention urgente - Débordement"),
    MAINTENANCE_PREVENTIVE("Maintenance préventive"),
    DEBOUCHAGE("Débouchage canalisation"),
    POMPAGE("Pompage"),
    HYDROCURAGE("Hydrocurage haute pression"),
    DIAGNOSTIC("Diagnostic assainissement"),
    OTHER("Autre intervention");
    
    private final String displayName;
    
    MissionType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
