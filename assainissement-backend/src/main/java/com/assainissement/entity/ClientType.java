package com.assainissement.entity;

public enum ClientType {
    PARTICULIER("Particulier"),
    ENTREPRISE("Entreprise"),
    MUNICIPALITE("Municipalité"),
    SYNDIC("Syndic"),
    COLLECTIVITE("Collectivité"),
    ADMINISTRATION("Administration"),
    OTHER("Autre");
    
    private final String displayName;
    
    ClientType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
