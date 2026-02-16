import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mission, MissionStatus, MISSION_TYPE_LABELS, MISSION_STATUS_LABELS } from '../../core/models/mission.model';
import { MissionService } from '../../core/services/mission.service';
import { AbsenceService } from '../../core/services/absence.service';
import { Absence, ABSENCE_TYPE_LABELS, ABSENCE_STATUS_LABELS } from '../../core/models/dashboard.model';

interface PendingApproval {
  type: 'mission' | 'absence';
  id: number;
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: Date;
  details: any;
}

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="approvals-page">
      <div class="page-header">
        <div class="header-content">
          <h1>✅ Approbations en Attente</h1>
          <p>Validez les missions terminées et les demandes d'absence</p>
        </div>
        <div class="header-actions">
          <span class="pending-count" *ngIf="totalPending() > 0">
            {{ totalPending() }} en attente
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab() === 'missions'"
          (click)="activeTab.set('missions')"
        >
          🎯 Missions
          <span class="badge" *ngIf="pendingMissions().length > 0">{{ pendingMissions().length }}</span>
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab() === 'absences'"
          (click)="activeTab.set('absences')"
        >
          🏖️ Absences
          <span class="badge" *ngIf="pendingAbsences().length > 0">{{ pendingAbsences().length }}</span>
        </button>
      </div>

      <!-- Missions Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'missions'">
        <div class="approvals-list" *ngIf="pendingMissions().length > 0">
          @for (mission of pendingMissions(); track mission.id) {
            <div class="approval-card">
              <div class="approval-icon">
                {{ getMissionIcon(mission.type) }}
              </div>
              
              <div class="approval-info">
                <div class="approval-header">
                  <h3>{{ mission.title }}</h3>
                  <span class="mission-type">{{ MISSION_TYPE_LABELS[mission.type] }}</span>
                </div>
                
                <p class="approval-description">{{ mission.description }}</p>
                
                <div class="approval-meta">
                  <span class="meta-item">
                    👤 {{ mission.employeeName || 'Non assigné' }}
                  </span>
                  <span class="meta-item">
                    📍 {{ mission.address }}
                  </span>
                  <span class="meta-item">
                    📅 {{ mission.scheduledDate | date:'dd/MM/yyyy' }}
                  </span>
                </div>

                <div class="photos-preview" *ngIf="mission.photos?.length">
                  <span class="photos-count">📷 {{ mission.photos!.length }} photos</span>
                </div>
              </div>

              <div class="approval-actions">
                <button class="btn btn-success" (click)="approveMission(mission)">
                  ✓ Valider
                </button>
                <button class="btn btn-outline" (click)="viewMissionDetails(mission)">
                  Détails
                </button>
                <button class="btn btn-danger-outline" (click)="rejectMission(mission)">
                  ✗ Rejeter
                </button>
              </div>
            </div>
          }
        </div>

        <div class="empty-state" *ngIf="pendingMissions().length === 0">
          <span class="empty-icon">✅</span>
          <h3>Aucune mission en attente</h3>
          <p>Toutes les missions ont été validées</p>
        </div>
      </div>

      <!-- Absences Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'absences'">
        <div class="approvals-list" *ngIf="pendingAbsences().length > 0">
          @for (absence of pendingAbsences(); track absence.id) {
            <div class="approval-card">
              <div class="approval-icon">
                {{ getAbsenceIcon(absence.type) }}
              </div>
              
              <div class="approval-info">
                <div class="approval-header">
                  <h3>{{ ABSENCE_TYPE_LABELS[absence.type] }}</h3>
                  <span class="absence-duration">{{ getDuration(absence) }} jour(s)</span>
                </div>
                
                <p class="approval-description" *ngIf="absence.reason">
                  {{ absence.reason }}
                </p>
                
                <div class="approval-meta">
                  <span class="meta-item">
                    👤 {{ absence.employeeName }}
                  </span>
                  <span class="meta-item">
                    📅 {{ absence.startDate | date:'dd/MM/yyyy' }} → {{ absence.endDate | date:'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>

              <div class="approval-actions">
                <button class="btn btn-success" (click)="approveAbsence(absence)">
                  ✓ Approuver
                </button>
                <button class="btn btn-danger-outline" (click)="rejectAbsence(absence)">
                  ✗ Refuser
                </button>
              </div>
            </div>
          }
        </div>

        <div class="empty-state" *ngIf="pendingAbsences().length === 0">
          <span class="empty-icon">🏖️</span>
          <h3>Aucune demande d'absence</h3>
          <p>Toutes les demandes ont été traitées</p>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner-large"></div>
        <p>Chargement...</p>
      </div>
    </div>
  `,
  styles: [`
    .approvals-page {
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

    .pending-count {
      background: var(--warning-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: white;
      padding: 0.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }

    .tab {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-light);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .tab:hover {
      background: var(--background-color);
    }

    .tab.active {
      background: var(--primary-color);
      color: white;
    }

    .tab .badge {
      background: rgba(255, 255, 255, 0.3);
      padding: 0.125rem 0.5rem;
      border-radius: 10px;
      font-size: 0.75rem;
    }

    .tab.active .badge {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Approvals List */
    .approvals-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .approval-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      gap: 1.5rem;
      box-shadow: var(--shadow-sm);
      border-left: 4px solid var(--warning-color);
    }

    .approval-icon {
      font-size: 2.5rem;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-color);
      border-radius: 12px;
      flex-shrink: 0;
    }

    .approval-info {
      flex: 1;
    }

    .approval-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .approval-header h3 {
      font-size: 1.125rem;
      color: var(--text-color);
      margin: 0;
    }

    .mission-type, .absence-duration {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      background: rgba(30, 136, 229, 0.1);
      color: var(--primary-color);
    }

    .absence-duration {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .approval-description {
      color: var(--text-light);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .approval-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .meta-item {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .photos-preview {
      margin-top: 0.75rem;
    }

    .photos-count {
      font-size: 0.875rem;
      color: var(--primary-color);
      background: rgba(30, 136, 229, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .approval-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .btn-danger-outline {
      background: transparent;
      border: 2px solid var(--danger-color);
      color: var(--danger-color);
    }

    .btn-danger-outline:hover {
      background: var(--danger-color);
      color: white;
    }

    /* States */
    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
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

    .empty-state h3 {
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-light);
    }

    @media (max-width: 768px) {
      .approval-card {
        flex-direction: column;
      }

      .approval-icon {
        width: 48px;
        height: 48px;
        font-size: 1.5rem;
      }

      .approval-actions {
        flex-direction: row;
      }

      .tabs {
        flex-direction: column;
      }
    }
  `]
})
export class ApprovalListComponent implements OnInit {
  private missionService = inject(MissionService);
  private absenceService = inject(AbsenceService);

  activeTab = signal<'missions' | 'absences'>('missions');
  isLoading = signal(true);
  
  pendingMissions = signal<Mission[]>([]);
  pendingAbsences = signal<Absence[]>([]);

  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  ABSENCE_TYPE_LABELS = ABSENCE_TYPE_LABELS;
  ABSENCE_STATUS_LABELS = ABSENCE_STATUS_LABELS;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load pending missions (PENDING_VALIDATION status)
    this.missionService.getMissions({ status: 'PENDING_VALIDATION' }).subscribe({
      next: (missions) => {
        this.pendingMissions.set(missions);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load missions:', err);
        this.isLoading.set(false);
      }
    });

    // Load pending absences
    this.absenceService.getPendingAbsences().subscribe({
      next: (absences) => this.pendingAbsences.set(absences),
      error: (err) => console.error('Failed to load absences:', err)
    });
  }

  totalPending(): number {
    return this.pendingMissions().length + this.pendingAbsences().length;
  }

  getMissionIcon(type: string): string {
    const icons: Record<string, string> = {
      'DEBOUCHAGE': '🔧',
      'CURAGE': '🚿',
      'INSPECTION_CAMERA': '📹',
      'POMPAGE': '⚡',
      'ENTRETIEN': '🔨',
      'URGENCE': '🚨',
      'AUTRE': '📋'
    };
    return icons[type] || '📋';
  }

  getAbsenceIcon(type: string): string {
    const icons: Record<string, string> = {
      'CONGE_PAYE': '🏖️',
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

  approveMission(mission: Mission): void {
    if (confirm(`Valider la mission "${mission.title}" ?`)) {
      this.missionService.updateMissionStatus(mission.id, 'COMPLETED').subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Failed to approve mission:', err)
      });
    }
  }

  rejectMission(mission: Mission): void {
    const reason = prompt('Motif du rejet:');
    if (reason) {
      this.missionService.updateMissionStatus(mission.id, 'IN_PROGRESS').subscribe({
        next: () => {
          alert('Mission renvoyée pour correction');
          this.loadData();
        },
        error: (err) => console.error('Failed to reject mission:', err)
      });
    }
  }

  viewMissionDetails(mission: Mission): void {
    // Could open a modal or navigate to mission detail
    alert(`Détails de la mission: ${mission.title}\n\n${mission.description}`);
  }

  approveAbsence(absence: Absence): void {
    if (confirm(`Approuver la demande de ${absence.employeeName} ?`)) {
      this.absenceService.approveAbsence(absence.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Failed to approve absence:', err)
      });
    }
  }

  rejectAbsence(absence: Absence): void {
    const reason = prompt('Motif du refus:');
    if (reason) {
      this.absenceService.rejectAbsence(absence.id, reason).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Failed to reject absence:', err)
      });
    }
  }
}
