# 🚿 AssainissementPro - Plateforme de Gestion des Opérations Terrain

Une application complète de gestion des missions pour les entreprises d'assainissement, avec calendrier intelligent, suivi des preuves de travail, gamification et gestion RH.

## 📋 Fonctionnalités

### 🎯 Gestion des Missions
- Calendrier interactif (vue mois/semaine)
- Création et affectation de missions
- Suivi en temps réel du statut
- Photos avant/après comme preuve de travail
- Checklist de tâches
- Historique et timeline

### 👥 Gestion des Employés
- Répertoire des techniciens
- Suivi de disponibilité
- Affectation intelligente

### 🏆 Système de Gamification
- Points pour missions complétées
- Classement (leaderboard)
- Bonus de qualité et rapidité

### 🏖️ Gestion RH
- Demandes d'absences
- Workflow d'approbation
- Tableau de bord superviseur

### 📊 Reporting
- Tableau de bord avec KPIs
- Statistiques par employé
- Suivi des performances

---

## 🚀 Installation et Démarrage

### Prérequis
- **Java 17+** (pour le backend)
- **Maven 3.8+** (pour le backend)
- **PostgreSQL 14+** (base de données)
- **Node.js 18+** (pour le frontend)
- **npm 9+** (pour le frontend)

### 1. Configuration de la Base de Données PostgreSQL

```sql
-- Connectez-vous à PostgreSQL et créez la base de données
CREATE DATABASE assainissement_db;
```

La configuration par défaut utilise:
- **Host:** localhost:5432
- **Database:** assainissement_db
- **Username:** postgres
- **Password:** postgres

Vous pouvez modifier ces paramètres dans `application.properties`.

### 2. Backend (Spring Boot)

```powershell
# Naviguer vers le dossier backend
cd assainissement-backend

# Compiler et lancer le backend (PostgreSQL)
mvn spring-boot:run

# OU lancer avec H2 en mémoire (pour développement rapide)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Le serveur démarre sur **http://localhost:8080**

### 3. Frontend (Angular)

```powershell
# Naviguer vers le dossier frontend
cd assainissement-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

L'application démarre sur **http://localhost:4200**

---

## 🔐 Création du Premier Compte Admin

Après le premier démarrage, créez un compte via l'API ou inscrivez-vous depuis l'interface:

```bash
# Créer un compte admin via curl
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "System",
    "email": "admin@assainissement.fr",
    "password": "admin123",
    "phone": "0600000000"
  }'
```

---

## 🏗️ Architecture

### Backend
```
assainissement-backend/
├── src/main/java/com/assainissement/
│   ├── config/          # Configuration (Security, JWT, CORS)
│   ├── controller/      # REST Controllers
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # Entités JPA
│   ├── enums/          # Énumérations
│   ├── repository/     # Repositories JPA
│   ├── security/       # JWT & Auth
│   └── service/        # Services métier
└── src/main/resources/
    └── application.properties
```

### Frontend
```
assainissement-frontend/
├── src/app/
│   ├── core/
│   │   ├── guards/      # Route guards
│   │   ├── interceptors/# HTTP interceptors
│   │   ├── models/      # TypeScript interfaces
│   │   └── services/    # Services Angular
│   ├── features/
│   │   ├── absences/    # Gestion absences
│   │   ├── approvals/   # Approbations
│   │   ├── auth/        # Login/Register
│   │   ├── calendar/    # Calendrier
│   │   ├── dashboard/   # Tableau de bord
│   │   ├── employees/   # Employés
│   │   ├── leaderboard/ # Classement
│   │   ├── missions/    # Missions
│   │   └── profile/     # Profil utilisateur
│   ├── layout/          # Composants layout
│   └── shared/          # Composants partagés
└── src/environments/    # Configuration
```

---

## 📱 Captures d'écran

### Dashboard
- Statistiques en temps réel
- Actions rapides
- Missions récentes
- Top performers

### Calendrier
- Vue mensuelle/hebdomadaire
- Missions colorées par priorité
- Détails au clic

### Gestion des Missions
- Liste avec filtres
- Formulaire de création
- Détail avec photos et checklist

---

## 🛠️ Technologies

### Backend
- Spring Boot 3.2.0
- Spring Security + JWT
- Spring Data JPA
- H2 Database (dev) / PostgreSQL (prod)
- Lombok
- iText PDF (rapports)

### Frontend
- Angular 17 (Standalone Components)
- RxJS
- Signals pour state management
- SCSS avec variables CSS
- Chart.js pour les graphiques

---

## 🔧 Configuration

### Backend (application.properties)

```properties
# Base de données
spring.datasource.url=jdbc:h2:mem:assainissement
spring.jpa.hibernate.ddl-auto=create-drop

# JWT
jwt.secret=votre-secret-jwt
jwt.expiration=86400000
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 📝 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Profil utilisateur

### Missions
- `GET /api/missions` - Liste des missions
- `POST /api/missions` - Créer une mission
- `GET /api/missions/{id}` - Détail mission
- `PUT /api/missions/{id}` - Modifier mission
- `PUT /api/missions/{id}/status` - Changer statut

### Employés
- `GET /api/employees` - Liste des employés
- `GET /api/employees/{id}` - Détail employé
- `GET /api/employees/available` - Employés disponibles

### Absences
- `GET /api/absences` - Liste des absences
- `POST /api/absences` - Demander une absence
- `PUT /api/absences/{id}/approve` - Approuver
- `PUT /api/absences/{id}/reject` - Refuser

### Points
- `GET /api/points/employee/{id}` - Historique points
- `GET /api/points/leaderboard` - Classement

---

## 🚧 Roadmap

- [ ] Notifications push
- [ ] Export Excel/PDF
- [ ] Mode hors-ligne (PWA)
- [ ] Géolocalisation
- [ ] Intégration IA pour validation photos
- [ ] Application mobile (Ionic/Capacitor)

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 👥 Équipe

Développé avec ❤️ pour les professionnels de l'assainissement.
