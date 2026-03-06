import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { PointTransaction } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="profile-avatar">
            {{ getInitials() }}
          </div>
          <div class="profile-info">
            <h1>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</h1>
            <p class="role-badge">{{ getRoleLabel() }}</p>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-grid">
          <!-- Main Info Card -->
          <div class="profile-card main-card">
            <div class="card-header">
              <h2><i class="fa-solid fa-user"></i> Informations Personnelles</h2>
              <button class="btn btn-sm btn-outline" (click)="toggleEdit()">
                {{ isEditing() ? 'Annuler' : 'Modifier' }}
              </button>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" *ngIf="isEditing()">
              <div class="form-row">
                <div class="form-group">
                  <label>Prénom</label>
                  <input type="text" formControlName="firstName" />
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input type="text" formControlName="lastName" />
                </div>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="email" formControlName="email" readonly />
              </div>

              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" formControlName="phone" />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Enregistrer</button>
              </div>
            </form>

            <div class="info-display" *ngIf="!isEditing()">
              <div class="info-row">
                <span class="info-label"><i class="fa-solid fa-envelope"></i> Email</span>
                <span class="info-value">{{ currentUser()?.email }}</span>
              </div>
              <div class="info-row" *ngIf="currentEmployee()?.phone">
                <span class="info-label"><i class="fa-solid fa-mobile-screen"></i> Téléphone</span>
                <span class="info-value">{{ currentEmployee()?.phone }}</span>
              </div>
              <div class="info-row" *ngIf="currentEmployee()?.jobTitle">
                <span class="info-label"><i class="fa-solid fa-briefcase"></i> Poste</span>
                <span class="info-value">{{ currentEmployee()?.jobTitle }}</span>
              </div>
              <div class="info-row" *ngIf="currentEmployee()?.hireDate">
                <span class="info-label"><i class="fa-regular fa-calendar"></i> Date d'embauche</span>
                <span class="info-value">{{ currentEmployee()?.hireDate | date:'dd MMMM yyyy':'':'fr-FR' }}</span>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="profile-card stats-card">
            <div class="card-header">
              <h2><i class="fa-solid fa-chart-bar"></i> Statistiques</h2>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-icon"><i class="fa-solid fa-trophy"></i></span>
                <span class="stat-value">{{ currentEmployee()?.totalPoints || 0 }}</span>
                <span class="stat-label">Points</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon"><i class="fa-solid fa-circle-check"></i></span>
                <span class="stat-value">{{ currentEmployee()?.completedMissions || 0 }}</span>
                <span class="stat-label">Missions</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon"><i class="fa-solid fa-ranking-star"></i></span>
                <span class="stat-value">#{{ currentEmployee()?.leaderboardRank || '-' }}</span>
                <span class="stat-label">Classement</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon"><i class="fa-solid fa-star"></i></span>
                <span class="stat-value">{{ currentEmployee()?.avgRating?.toFixed(1) || '-' }}</span>
                <span class="stat-label">Note moyenne</span>
              </div>
            </div>
          </div>

          <!-- Skills Card -->
          <div class="profile-card skills-card" *ngIf="currentEmployee()?.skills">
            <div class="card-header">
              <h2><i class="fa-solid fa-wrench"></i> Compétences</h2>
            </div>
            <div class="skills-list">
              @for (skill of currentEmployee()?.skills; track skill) {
                <span class="skill-tag">{{ skill }}</span>
              }
            </div>
          </div>

          <!-- Recent Points Card -->
          <div class="profile-card points-card">
            <div class="card-header">
              <h2><i class="fa-solid fa-coins"></i> Points Récents</h2>
            </div>
            <div class="transactions-list" *ngIf="transactions().length > 0">
              @for (transaction of transactions().slice(0, 10); track transaction.id) {
                <div class="transaction-item" [class.positive]="transaction.points > 0">
                  <div class="transaction-info">
                    <span class="transaction-type">{{ POINT_TRANSACTION_TYPE_LABELS[transaction.type] }}</span>
                    <span class="transaction-reason">{{ transaction.reason }}</span>
                    <span class="transaction-date">{{ transaction.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <span class="transaction-points" [class.positive]="transaction.points > 0">
                    {{ transaction.points > 0 ? '+' : '' }}{{ transaction.points }}
                  </span>
                </div>
              }
            </div>
            <div class="empty-state" *ngIf="transactions().length === 0">
              <p>Aucune transaction de points</p>
            </div>
          </div>

          <!-- Security Card -->
          <div class="profile-card security-card">
            <div class="card-header">
              <h2><i class="fa-solid fa-lock"></i> Sécurité</h2>
            </div>
            <button class="btn btn-outline btn-block" (click)="openChangePasswordModal()">
              Changer le mot de passe
            </button>
            <button class="btn btn-danger btn-block" (click)="logout()">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    @if (showPasswordModal()) {
      <div class="modal-overlay" (click)="closePasswordModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fa-solid fa-key"></i> Changer le mot de passe</h2>
            <button class="close-btn" (click)="closePasswordModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="submitChangePassword()">
            <div class="form-group">
              <label>Mot de passe actuel</label>
              <input type="password" [(ngModel)]="passwordForm.currentPassword" 
                     name="currentPassword" required />
            </div>
            <div class="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwordForm.newPassword" 
                     name="newPassword" required minlength="6" />
            </div>
            <div class="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwordForm.confirmPassword" 
                     name="confirmPassword" required />
            </div>
            @if (passwordError()) {
              <div class="error-message">
                <i class="fa-solid fa-circle-exclamation"></i> {{ passwordError() }}
              </div>
            }
            @if (passwordSuccess()) {
              <div class="success-message">
                <i class="fa-solid fa-circle-check"></i> {{ passwordSuccess() }}
              </div>
            }
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closePasswordModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmittingPassword()">
                {{ isSubmittingPassword() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    .profile-header {
      position: relative;
      margin-bottom: 4rem;
    }

    .header-background {
      height: 180px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      border-radius: 16px;
    }

    .header-content {
      position: absolute;
      bottom: -3rem;
      left: 2rem;
      display: flex;
      align-items: flex-end;
      gap: 1.5rem;
    }

    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      box-shadow: var(--shadow-lg);
      border: 4px solid white;
    }

    .profile-info h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(30, 136, 229, 0.1);
      color: var(--primary-color);
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .profile-content {
      margin-top: 2rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .profile-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .card-header h2 {
      font-size: 1.125rem;
      color: var(--text-color);
      margin: 0;
    }

    /* Form Styles */
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-group input[readonly] {
      background: var(--background-color);
      color: var(--text-light);
    }

    .form-actions {
      margin-top: 1.5rem;
    }

    /* Info Display */
    .info-display {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: var(--text-light);
    }

    .info-value {
      font-weight: 500;
      color: var(--text-color);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: var(--background-color);
      border-radius: 12px;
    }

    .stat-icon {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      display: block;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-light);
      text-transform: uppercase;
    }

    /* Skills */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      padding: 0.5rem 1rem;
      background: rgba(30, 136, 229, 0.1);
      color: var(--primary-color);
      border-radius: 20px;
      font-size: 0.875rem;
    }

    /* Transactions */
    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--background-color);
      border-radius: 8px;
    }

    .transaction-info {
      display: flex;
      flex-direction: column;
    }

    .transaction-type {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .transaction-reason {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .transaction-date {
      font-size: 0.625rem;
      color: var(--text-light);
    }

    .transaction-points {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--danger-color);
    }

    .transaction-points.positive {
      color: var(--success-color);
    }

    /* Security Card */
    .security-card {
      grid-column: span 2;
    }

    .security-card .btn {
      margin-bottom: 0.5rem;
    }

    .security-card .btn:last-child {
      margin-bottom: 0;
    }

    .btn-block {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-light);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
      }

      .profile-grid {
        grid-template-columns: 1fr;
      }

      .security-card {
        grid-column: span 1;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--card-background);
      border-radius: 12px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-light);
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--text-color);
    }

    .modal-content form {
      padding: 1.5rem;
    }

    .modal-content .form-group {
      margin-bottom: 1rem;
    }

    .modal-content label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .modal-content input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .modal-content input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .success-message {
      background: #f0fdf4;
      color: #16a34a;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly dashboardService = inject(DashboardService);

  currentUser = this.authService.currentUser;
  currentEmployee = this.authService.currentEmployee;

  isEditing = signal(false);
  transactions = signal<PointTransaction[]>([]);
  
  // Password change
  showPasswordModal = signal(false);
  isSubmittingPassword = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  profileForm: FormGroup;

  POINT_TRANSACTION_TYPE_LABELS: Record<string, string> = {
    'MISSION_COMPLETED': 'Mission terminée',
    'BONUS': 'Bonus',
    'EARLY_COMPLETION': 'Terminé en avance',
    'QUALITY_BONUS': 'Bonus qualité',
    'PENALTY': 'Pénalité',
    'MANUAL_ADJUSTMENT': 'Ajustement manuel'
  };

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfileData();
    this.loadTransactions();
  }

  loadProfileData(): void {
    if (this.currentUser()) {
      this.profileForm.patchValue({
        firstName: this.currentUser()!.firstName,
        lastName: this.currentUser()!.lastName,
        email: this.currentUser()!.email,
        phone: this.currentEmployee()?.phone || ''
      });
    }
  }

  loadTransactions(): void {
    const employeeId = this.currentEmployee()?.id;
    if (employeeId) {
      this.dashboardService.getEmployeeTransactions(employeeId).subscribe({
        next: (transactions) => this.transactions.set(transactions),
        error: (err) => console.error('Failed to load transactions:', err)
      });
    }
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      'WORKER': 'Technicien',
      'SUPERVISOR': 'Superviseur',
      'EMPLOYER': 'Employeur',
      'ADMIN': 'Administrateur',
      'HR': 'Ressources Humaines'
    };
    return labels[this.currentUser()?.role || ''] || this.currentUser()?.role || '';
  }

  toggleEdit(): void {
    this.isEditing.update(v => !v);
    if (this.isEditing()) {
      this.loadProfileData();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const { firstName, lastName, phone } = this.profileForm.value;
    const employeeId = this.currentEmployee()?.id;

    if (employeeId) {
      this.employeeService.updateEmployee(employeeId, { firstName, lastName, phone }).subscribe({
        next: () => {
          this.isEditing.set(false);
          this.authService.refreshCurrentUser().subscribe();
        },
        error: (err) => console.error('Failed to update profile:', err)
      });
    }
  }

  openChangePasswordModal(): void {
    this.showPasswordModal.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
  }

  submitChangePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.passwordError.set('Tous les champs sont obligatoires');
      return;
    }

    if (newPassword.length < 6) {
      this.passwordError.set('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.isSubmittingPassword.set(true);
    this.passwordError.set('');

    this.authService.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.passwordSuccess.set('Mot de passe modifié avec succès');
        this.isSubmittingPassword.set(false);
        setTimeout(() => this.closePasswordModal(), 2000);
      },
      error: (err) => {
        this.passwordError.set(err.error?.error || 'Erreur lors du changement de mot de passe');
        this.isSubmittingPassword.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
