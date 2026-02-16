import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbsenceService } from '../../../core/services/absence.service';
import { AuthService } from '../../../core/services/auth.service';
import { Absence, AbsenceStatus, AbsenceType, ABSENCE_TYPE_LABELS, ABSENCE_STATUS_LABELS } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-absence-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="absence-list-page">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fa-solid fa-umbrella-beach"></i> Gestion des Absences</h1>
          <p>Demandes de congés et absences</p>
        </div>
        <button class="btn btn-primary" (click)="openNewAbsenceModal()">
          <i class="fa-solid fa-plus"></i> Nouvelle Demande
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-icon"><i class="fa-solid fa-clipboard-list"></i></span>
          <div class="stat-content">
            <span class="stat-value">{{ totalAbsences() }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div class="stat-card pending">
          <span class="stat-icon"><i class="fa-solid fa-hourglass-half"></i></span>
          <div class="stat-content">
            <span class="stat-value">{{ pendingAbsences() }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </div>
        <div class="stat-card approved">
          <span class="stat-icon"><i class="fa-solid fa-circle-check"></i></span>
          <div class="stat-content">
            <span class="stat-value">{{ approvedAbsences() }}</span>
            <span class="stat-label">Approuvées</span>
          </div>
        </div>
        <div class="stat-card rejected">
          <span class="stat-icon"><i class="fa-solid fa-circle-xmark"></i></span>
          <div class="stat-content">
            <span class="stat-value">{{ rejectedAbsences() }}</span>
            <span class="stat-label">Refusées</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
          <option value="">Tous les statuts</option>
          @for (status of statuses; track status) {
            <option [value]="status">{{ ABSENCE_STATUS_LABELS[status] }}</option>
          }
        </select>

        <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
          <option value="">Tous les types</option>
          @for (type of types; track type) {
            <option [value]="type">{{ ABSENCE_TYPE_LABELS[type] }}</option>
          }
        </select>
      </div>

      <!-- Absences List -->
      <div class="absences-list" *ngIf="!isLoading()">
        @for (absence of filteredAbsences(); track absence.id) {
          <div class="absence-card" [class]="'status-' + absence.status.toLowerCase()">
            <div class="absence-type-icon">
              {{ getTypeIcon(absence.type) }}
            </div>
            
            <div class="absence-info">
              <div class="absence-header">
                <span class="absence-type">{{ ABSENCE_TYPE_LABELS[absence.type] }}</span>
                <span class="absence-status" [class]="'status-' + absence.status.toLowerCase()">
                  {{ ABSENCE_STATUS_LABELS[absence.status] }}
                </span>
              </div>
              
              <div class="absence-dates">
                <span class="date-range">
                  {{ absence.startDate | date:'dd/MM/yyyy' }} 
                  → 
                  {{ absence.endDate | date:'dd/MM/yyyy' }}
                </span>
                <span class="duration">{{ getDuration(absence) }} jour(s)</span>
              </div>

              <p class="absence-reason" *ngIf="absence.reason">
                {{ absence.reason }}
              </p>

              <div class="absence-employee" *ngIf="isSupervisor()">
                <span><i class="fa-solid fa-user"></i> {{ absence.employeeName }}</span>
              </div>
            </div>

            <div class="absence-actions" *ngIf="isSupervisor() && absence.status === 'PENDING'">
              <button class="btn btn-sm btn-success" (click)="approveAbsence(absence)">
                Approuver
              </button>
              <button class="btn btn-sm btn-danger" (click)="rejectAbsence(absence)">
                Refuser
              </button>
            </div>

            <div class="absence-actions" *ngIf="!isSupervisor() && absence.status === 'PENDING'">
              <button class="btn btn-sm btn-outline" (click)="cancelAbsence(absence)">
                Annuler
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner-large"></div>
        <p>Chargement des absences...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading() && filteredAbsences().length === 0">
        <span class="empty-icon"><i class="fa-solid fa-umbrella-beach"></i></span>
        <h3>Aucune absence</h3>
        <p>Vous n'avez pas de demandes d'absence</p>
        <button class="btn btn-primary" (click)="openNewAbsenceModal()">
          Faire une demande
        </button>
      </div>

      <!-- New Absence Modal -->
      <div class="modal-overlay" *ngIf="showNewAbsenceModal()" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nouvelle Demande d'Absence</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Type d'absence</label>
              <select [(ngModel)]="newAbsence.type">
                @for (type of types; track type) {
                  <option [value]="type">{{ ABSENCE_TYPE_LABELS[type] }}</option>
                }
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date de début</label>
                <input type="date" [(ngModel)]="newAbsence.startDate" />
              </div>

              <div class="form-group">
                <label>Date de fin</label>
                <input type="date" [(ngModel)]="newAbsence.endDate" />
              </div>
            </div>

            <div class="form-group">
              <label>Motif (optionnel)</label>
              <textarea 
                [(ngModel)]="newAbsence.reason" 
                rows="3"
                placeholder="Précisez la raison de votre demande..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Annuler</button>
            <button class="btn btn-primary" (click)="submitAbsence()">
              Soumettre la demande
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .absence-list-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .header-content p {
      color: var(--text-light);
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
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .stat-card.pending .stat-value { color: var(--warning-color); }
    .stat-card.approved .stat-value { color: var(--success-color); }
    .stat-card.rejected .stat-value { color: var(--danger-color); }

    /* Filters */
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filters-section select {
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 0.875rem;
      min-width: 180px;
    }

    /* Absences List */
    .absences-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .absence-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      gap: 1.5rem;
      box-shadow: var(--shadow-sm);
      border-left: 4px solid var(--border-color);
    }

    .absence-card.status-pending { border-left-color: var(--warning-color); }
    .absence-card.status-approved { border-left-color: var(--success-color); }
    .absence-card.status-rejected { border-left-color: var(--danger-color); }
    .absence-card.status-cancelled { border-left-color: var(--text-light); }

    .absence-type-icon {
      font-size: 2rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-color);
      border-radius: 12px;
    }

    .absence-info {
      flex: 1;
    }

    .absence-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .absence-type {
      font-weight: 600;
      color: var(--text-color);
    }

    .absence-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .absence-status.status-pending { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .absence-status.status-approved { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .absence-status.status-rejected { background: rgba(244, 67, 54, 0.1); color: var(--danger-color); }
    .absence-status.status-cancelled { background: rgba(158, 158, 158, 0.1); color: #757575; }

    .absence-dates {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .date-range {
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .duration {
      font-size: 0.75rem;
      color: var(--text-light);
      background: var(--background-color);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .absence-reason {
      font-size: 0.875rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
    }

    .absence-employee {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .absence-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
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
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-light);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-section {
        flex-direction: column;
      }

      .absence-card {
        flex-direction: column;
      }

      .absence-actions {
        flex-direction: row;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AbsenceListComponent implements OnInit {
  private absenceService = inject(AbsenceService);
  private authService = inject(AuthService);

  isSupervisor = this.authService.isSupervisor;

  absences = signal<Absence[]>([]);
  filteredAbsences = signal<Absence[]>([]);
  isLoading = signal(true);
  showNewAbsenceModal = signal(false);

  filterStatus = '';
  filterType = '';

  statuses = Object.keys(ABSENCE_STATUS_LABELS) as AbsenceStatus[];
  types = Object.keys(ABSENCE_TYPE_LABELS) as AbsenceType[];
  ABSENCE_STATUS_LABELS = ABSENCE_STATUS_LABELS;
  ABSENCE_TYPE_LABELS = ABSENCE_TYPE_LABELS;

  newAbsence = {
    type: 'CONGE_PAYE' as AbsenceType,
    startDate: '',
    endDate: '',
    reason: ''
  };

  ngOnInit(): void {
    this.loadAbsences();
  }

  loadAbsences(): void {
    this.isLoading.set(true);
    const observable = this.isSupervisor() 
      ? this.absenceService.getAllAbsences()
      : this.absenceService.getEmployeeAbsences(this.authService.currentEmployee()!.id);

    observable.subscribe({
      next: (absences) => {
        this.absences.set(absences);
        this.filteredAbsences.set(absences);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load absences:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let result = this.absences();

    if (this.filterStatus) {
      result = result.filter(a => a.status === this.filterStatus);
    }

    if (this.filterType) {
      result = result.filter(a => a.type === this.filterType);
    }

    this.filteredAbsences.set(result);
  }

  getTypeIcon(type: AbsenceType): string {
    const icons: Record<string, string> = {
      'CONGE_PAYE': '🏖',
      'CONGE_SANS_SOLDE': '📋',
      'RTT': '⏰',
      'MALADIE': '🤒',
      'MALADIE_PROFESSIONNELLE': '🏥',
      'ACCIDENT_TRAVAIL': '🚑',
      'MATERNITE': '👶',
      'PATERNITE': '👨‍👧',
      'FORMATION': '📚',
      'ABSENCE_JUSTIFIEE': '✅',
      'ABSENCE_INJUSTIFIEE': '❌',
      'CONGE_EXCEPTIONNEL': '⭐',
      'TELETRAVAIL': '🏠',
      'OTHER': '📝'
    };
    return icons[type] || '📋';
  }

  getDuration(absence: Absence): number {
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  totalAbsences(): number {
    return this.absences().length;
  }

  pendingAbsences(): number {
    return this.absences().filter(a => a.status === 'PENDING').length;
  }

  approvedAbsences(): number {
    return this.absences().filter(a => a.status === 'APPROVED').length;
  }

  rejectedAbsences(): number {
    return this.absences().filter(a => a.status === 'REJECTED').length;
  }

  openNewAbsenceModal(): void {
    this.showNewAbsenceModal.set(true);
  }

  closeModal(): void {
    this.showNewAbsenceModal.set(false);
    this.newAbsence = {
      type: 'CONGE_PAYE',
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  submitAbsence(): void {
    if (!this.newAbsence.startDate || !this.newAbsence.endDate) {
      alert('Veuillez sélectionner les dates');
      return;
    }

    this.absenceService.createAbsence({
      type: this.newAbsence.type,
      startDate: new Date(this.newAbsence.startDate).toISOString(),
      endDate: new Date(this.newAbsence.endDate).toISOString(),
      reason: this.newAbsence.reason,
      employeeId: this.authService.currentEmployee()!.id
    }).subscribe({
      next: () => {
        this.closeModal();
        this.loadAbsences();
      },
      error: (err: unknown) => {
        console.error('Failed to create absence:', err);
        alert('Erreur lors de la création de la demande');
      }
    });
  }

  approveAbsence(absence: Absence): void {
    this.absenceService.approveAbsence(absence.id).subscribe({
      next: () => this.loadAbsences()
    });
  }

  rejectAbsence(absence: Absence): void {
    const notes = prompt('Motif du refus:');
    if (notes) {
      this.absenceService.rejectAbsence(absence.id, notes).subscribe({
        next: () => this.loadAbsences()
      });
    }
  }

  cancelAbsence(absence: Absence): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette demande?')) {
      this.absenceService.cancelAbsence(absence.id).subscribe({
        next: () => this.loadAbsences()
      });
    }
  }
}
