import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, CreateEmployeeRequest, ContractType } from '../../../core/models/user.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="employee-list-page">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fa-solid fa-users"></i> Gestion des Employés</h1>
          <p>{{ filteredEmployees().length }} employé(s)</p>
        </div>
        @if (canManageEmployees()) {
          <button class="btn btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-plus"></i> Nouvel Employé
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher un employé..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
          />
          <span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filterSkill" (ngModelChange)="applyFilters()">
            <option value="">Toutes compétences</option>
            @for (skill of availableSkills; track skill) {
              <option [value]="skill">{{ skill }}</option>
            }
          </select>

          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
            <option value="">Tous statuts</option>
            <option value="available">Disponible</option>
            <option value="busy">En mission</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ totalEmployees() }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card available">
          <span class="stat-value">{{ availableEmployees() }}</span>
          <span class="stat-label">Disponibles</span>
        </div>
        <div class="stat-card busy">
          <span class="stat-value">{{ busyEmployees() }}</span>
          <span class="stat-label">En mission</span>
        </div>
        <div class="stat-card absent">
          <span class="stat-value">{{ absentEmployees() }}</span>
          <span class="stat-label">Absents</span>
        </div>
      </div>

      <!-- Employee Grid -->
      <div class="employees-grid" *ngIf="!isLoading()">
        @for (employee of filteredEmployees(); track employee.id) {
          <div class="employee-card">
            <div class="card-header">
              <div class="employee-avatar" [style.background]="getAvatarColor(employee)">
                {{ getInitials(employee) }}
              </div>
              <div class="status-indicator" [class]="'status-' + getEmployeeStatus(employee)"></div>
            </div>

            <div class="card-body">
              <h3>{{ employee.firstName }} {{ employee.lastName }}</h3>
              <p class="employee-title">{{ employee.jobTitle || 'Technicien' }}</p>
              
              <div class="employee-contact">
                <a [href]="'mailto:' + employee.email" class="contact-item">
                  <i class="fa-solid fa-envelope"></i> {{ employee.email }}
                </a>
                <a [href]="'tel:' + employee.phone" class="contact-item" *ngIf="employee.phone">
                  <i class="fa-solid fa-mobile-screen"></i> {{ employee.phone }}
                </a>
              </div>

              <div class="employee-skills" *ngIf="employee.skills && employee.skills.length > 0">
                @for (skill of employee.skills.slice(0, 3); track skill) {
                  <span class="skill-tag">{{ skill }}</span>
                }
                <span class="skill-more" *ngIf="employee.skills.length > 3">
                  +{{ employee.skills.length - 3 }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <div class="stats">
                <div class="stat">
                  <span class="stat-value">{{ employee.totalPoints || 0 }}</span>
                  <span class="stat-label">Points</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ employee.completedMissions || 0 }}</span>
                  <span class="stat-label">Missions</span>
                </div>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/employees', employee.id]" class="btn btn-sm btn-outline">
                  Voir profil
                </a>
                @if (canManageEmployees()) {
                  <button class="btn btn-sm btn-danger" (click)="confirmDelete(employee)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner-large"></div>
        <p>Chargement des employés...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading() && filteredEmployees().length === 0">
        <span class="empty-icon"><i class="fa-solid fa-users"></i></span>
        <h3>Aucun employé trouvé</h3>
        <p>Modifiez vos filtres de recherche</p>
      </div>

      <!-- Create Employee Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2><i class="fa-solid fa-user-plus"></i> Nouvel Employé</h2>
              <button class="close-btn" (click)="closeCreateModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form (ngSubmit)="createEmployee()">
              <div class="form-grid">
                <div class="form-group">
                  <label>Prénom *</label>
                  <input type="text" [(ngModel)]="newEmployee.firstName" name="firstName" required />
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" [(ngModel)]="newEmployee.lastName" name="lastName" required />
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" [(ngModel)]="newEmployee.email" name="email" required />
                </div>
                <div class="form-group">
                  <label>Mot de passe *</label>
                  <input type="password" [(ngModel)]="newEmployee.password" name="password" required />
                </div>
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" [(ngModel)]="newEmployee.phone" name="phone" />
                </div>
                <div class="form-group">
                  <label>Rôle *</label>
                  <select [(ngModel)]="newEmployee.role" name="role" required>
                    <option value="WORKER">Technicien</option>
                    <option value="SUPERVISOR">Superviseur</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Type de contrat</label>
                  <select [(ngModel)]="newEmployee.contractType" name="contractType">
                    <option value="">Sélectionner...</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="INTERIM">Intérim</option>
                    <option value="APPRENTICE">Apprenti</option>
                    <option value="STAGE">Stage</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Date d'embauche</label>
                  <input type="date" [(ngModel)]="newEmployee.hireDate" name="hireDate" />
                </div>
              </div>
              <div class="form-group full-width">
                <label>Compétences</label>
                <div class="skills-picker">
                  @for (skill of availableSkills; track skill) {
                    <label class="skill-checkbox">
                      <input type="checkbox" [checked]="newEmployee.skills?.includes(skill)" 
                             (change)="toggleSkill(skill)" />
                      {{ skill }}
                    </label>
                  }
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeCreateModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="isCreating()">
                  @if (isCreating()) {
                    <span class="spinner"></span> Création...
                  } @else {
                    <i class="fa-solid fa-check"></i> Créer
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal-content modal-small" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2><i class="fa-solid fa-triangle-exclamation"></i> Confirmer la suppression</h2>
            </div>
            <div class="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer l'employé <strong>{{ employeeToDelete()?.firstName }} {{ employeeToDelete()?.lastName }}</strong>?</p>
              <p class="warning-text">Cette action désactivera le compte de l'employé.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeDeleteModal()">Annuler</button>
              <button type="button" class="btn btn-danger" (click)="deleteEmployee()" [disabled]="isDeleting()">
                @if (isDeleting()) {
                  <span class="spinner"></span> Suppression...
                } @else {
                  <i class="fa-solid fa-trash"></i> Supprimer
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .employee-list-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .header-content p {
      color: var(--text-light);
    }

    /* Filters */
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .search-box {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-box input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
    }

    .filter-group {
      display: flex;
      gap: 1rem;
    }

    .filter-group select {
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 0.875rem;
      min-width: 180px;
    }

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .stat-card .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-card .stat-label {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .stat-card.available .stat-value { color: var(--success-color); }
    .stat-card.busy .stat-value { color: var(--primary-color); }
    .stat-card.absent .stat-value { color: var(--warning-color); }

    /* Employee Grid */
    .employees-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .employee-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
    }

    .employee-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .card-header {
      padding: 1.5rem;
      display: flex;
      justify-content: center;
      position: relative;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    }

    .employee-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      border: 4px solid white;
      box-shadow: var(--shadow-md);
    }

    .status-indicator {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.status-available { background: var(--success-color); }
    .status-indicator.status-busy { background: var(--primary-color); }
    .status-indicator.status-absent { background: #9e9e9e; }

    .card-body {
      padding: 1.5rem;
      text-align: center;
    }

    .card-body h3 {
      font-size: 1.125rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .employee-title {
      color: var(--text-light);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .employee-contact {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .contact-item {
      font-size: 0.875rem;
      color: var(--text-light);
      text-decoration: none;
    }

    .contact-item:hover {
      color: var(--primary-color);
    }

    .employee-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .skill-tag {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      background: rgba(30, 136, 229, 0.1);
      color: var(--primary-color);
      border-radius: 20px;
    }

    .skill-more {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stats {
      display: flex;
      gap: 1.5rem;
    }

    .stat {
      text-align: center;
    }

    .stat .stat-value {
      display: block;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat .stat-label {
      font-size: 0.625rem;
      color: var(--text-light);
      text-transform: uppercase;
    }

    /* Loading & Empty */
    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .filter-group {
        flex-direction: column;
      }

      .filter-group select {
        width: 100%;
      }
    }

    /* Card Actions */
    .card-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-danger {
      background: var(--danger-color);
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-danger:hover {
      opacity: 0.9;
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
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }

    .modal-content.modal-small {
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 1.25rem;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-light);
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin-bottom: 0.5rem;
    }

    .warning-text {
      color: var(--danger-color);
      font-size: 0.875rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: span 2;
      padding: 0 1.5rem 1rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .skills-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .skill-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-color);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .skill-checkbox input {
      accent-color: var(--primary-color);
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-group.full-width {
        grid-column: span 1;
      }
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  employees = signal<Employee[]>([]);
  filteredEmployees = signal<Employee[]>([]);
  isLoading = signal(true);

  // Admin modal states
  showCreateModal = signal(false);
  showDeleteModal = signal(false);
  isCreating = signal(false);
  isDeleting = signal(false);
  employeeToDelete = signal<Employee | null>(null);

  // Check if current user can manage employees
  canManageEmployees = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'EMPLOYER';
  });

  // New employee form data
  newEmployee: CreateEmployeeRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'WORKER',
    skills: []
  };

  searchQuery = '';
  filterSkill = '';
  filterStatus = '';

  availableSkills = ['Curage', 'Inspection caméra', 'Débouchage', 'Pompage', 'Maintenance', 'Urgences'];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.filteredEmployees.set(employees);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load employees:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let result = this.employees();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(e => {
        const firstName = (e.firstName ?? e.user?.firstName ?? '').toLowerCase();
        const lastName = (e.lastName ?? e.user?.lastName ?? '').toLowerCase();
        const email = (e.email ?? e.user?.email ?? '').toLowerCase();
        return firstName.includes(query) ||
               lastName.includes(query) ||
               email.includes(query);
      });
    }

    if (this.filterSkill) {
      result = result.filter(e => 
        e.skills && e.skills.includes(this.filterSkill)
      );
    }

    if (this.filterStatus) {
      result = result.filter(e => this.getEmployeeStatus(e) === this.filterStatus);
    }

    this.filteredEmployees.set(result);
  }

  getInitials(employee: Employee): string {
    const first = employee.firstName ?? employee.user?.firstName ?? '';
    const last = employee.lastName ?? employee.user?.lastName ?? '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(employee: Employee): string {
    const colors = [
      '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', 
      '#00ACC1', '#E53935', '#3949AB', '#00897B'
    ];
    const first = employee.firstName ?? employee.user?.firstName ?? 'A';
    const last = employee.lastName ?? employee.user?.lastName ?? 'A';
    const index = (first.charCodeAt(0) + last.charCodeAt(0)) % colors.length;
    return colors[index];
  }

  getEmployeeStatus(employee: Employee): string {
    // Check online status from user
    const isOnline = employee.user?.online ?? false;
    
    // Could also check if employee has active mission
    // For now, return based on online status
    if (!isOnline) {
      return 'absent';
    }
    
    // If online but has status field, use it
    if (employee.status) {
      return employee.status.toLowerCase();
    }
    
    return 'available';
  }

  totalEmployees(): number {
    return this.employees().length;
  }

  availableEmployees(): number {
    return this.employees().filter(e => this.getEmployeeStatus(e) === 'available').length;
  }

  busyEmployees(): number {
    return this.employees().filter(e => this.getEmployeeStatus(e) === 'busy').length;
  }

  absentEmployees(): number {
    return this.employees().filter(e => this.getEmployeeStatus(e) === 'absent').length;
  }
}
