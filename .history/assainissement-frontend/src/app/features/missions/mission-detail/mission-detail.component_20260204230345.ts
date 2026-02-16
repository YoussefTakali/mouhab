import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MissionService } from '../../../core/services/mission.service';
import { PhotoService } from '../../../core/services/photo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Mission, Photo, MISSION_STATUS_LABELS, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../../core/models/mission.model';

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mission-detail-page" *ngIf="mission()">
      <!-- Header -->
      <div class="page-header">
        <a routerLink="/missions" class="back-link">← Retour aux missions</a>
        <div class="header-actions" *ngIf="isSupervisor()">
          <a [routerLink]="['/missions', mission()!.id, 'edit']" class="btn btn-outline">
            ✏️ Modifier
          </a>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Mission Info -->
        <div class="info-card main-info">
          <div class="card-header">
            <div class="mission-badges">
              <span class="mission-type" [class]="'type-' + mission()!.type.toLowerCase()">
                {{ MISSION_TYPE_LABELS[mission()!.type] }}
              </span>
              <span class="mission-priority" [class]="'priority-' + mission()!.priority.toLowerCase()">
                {{ MISSION_PRIORITY_LABELS[mission()!.priority] }}
              </span>
            </div>
            <span class="mission-status" [class]="'status-' + mission()!.status.toLowerCase()">
              {{ MISSION_STATUS_LABELS[mission()!.status] }}
            </span>
          </div>

          <h1 class="mission-title">{{ mission()!.title }}</h1>

          <div class="mission-description" *ngIf="mission()!.description">
            <p>{{ mission()!.description }}</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-icon">📅</span>
              <div class="info-content">
                <span class="info-label">Date Prévue</span>
                <span class="info-value">{{ mission()!.scheduledDate | date:'EEEE d MMMM yyyy à HH:mm':'':'fr-FR' }}</span>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon">📍</span>
              <div class="info-content">
                <span class="info-label">Adresse</span>
                <span class="info-value">{{ mission()!.address || 'Non spécifiée' }}</span>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon">🏢</span>
              <div class="info-content">
                <span class="info-label">Client</span>
                <span class="info-value">{{ mission()!.clientName || 'Non spécifié' }}</span>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon">👤</span>
              <div class="info-content">
                <span class="info-label">Assigné à</span>
                <span class="info-value">{{ mission()!.assignedEmployeeName || 'Non assigné' }}</span>
              </div>
            </div>

            <div class="info-item" *ngIf="mission()!.estimatedDuration">
              <span class="info-icon">⏱️</span>
              <div class="info-content">
                <span class="info-label">Durée Estimée</span>
                <span class="info-value">{{ mission()!.estimatedDuration }} minutes</span>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon">🏆</span>
              <div class="info-content">
                <span class="info-label">Points</span>
                <span class="info-value">{{ mission()!.basePoints || 0 }} points</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="info-card checklist-card" *ngIf="mission()!.checklist && mission()!.checklist!.length > 0">
          <h3>📋 Liste de Contrôle</h3>
          <div class="checklist">
            @for (item of mission()!.checklist; track item.id) {
              <div class="checklist-item" [class.completed]="item.completed">
                <input 
                  type="checkbox" 
                  [checked]="item.completed"
                  (change)="toggleChecklistItem(item)"
                  [disabled]="!canEdit()"
                />
                <span>{{ item.description }}</span>
              </div>
            }
          </div>
          <div class="checklist-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="checklistProgress() + '%'"></div>
            </div>
            <span>{{ checklistProgress() }}% complété</span>
          </div>
        </div>

        <!-- Photos Section -->
        <div class="info-card photos-card">
          <h3>📸 Photos</h3>
          
          <div class="photos-section">
            <h4>Avant Intervention</h4>
            <div class="photos-grid" *ngIf="beforePhotos().length > 0">
              @for (photo of beforePhotos(); track photo.id) {
                <div class="photo-item" (click)="openPhoto(photo)">
                  <img [src]="getPhotoUrl(photo.id)" [alt]="photo.description || 'Photo avant'" />
                  <div class="photo-overlay">
                    <span class="photo-time">{{ photo.capturedAt | date:'dd/MM HH:mm' }}</span>
                  </div>
                </div>
              }
            </div>
            <p class="no-photos" *ngIf="beforePhotos().length === 0">Aucune photo avant</p>
          </div>

          <div class="photos-section">
            <h4>Après Intervention</h4>
            <div class="photos-grid" *ngIf="afterPhotos().length > 0">
              @for (photo of afterPhotos(); track photo.id) {
                <div class="photo-item" (click)="openPhoto(photo)">
                  <img [src]="getPhotoUrl(photo.id)" [alt]="photo.description || 'Photo après'" />
                  <div class="photo-overlay">
                    <span class="photo-time">{{ photo.capturedAt | date:'dd/MM HH:mm' }}</span>
                  </div>
                </div>
              }
            </div>
            <p class="no-photos" *ngIf="afterPhotos().length === 0">Aucune photo après</p>
          </div>

          <button class="btn btn-outline upload-btn" *ngIf="canUploadPhotos()" (click)="openPhotoUpload()">
            📤 Ajouter des photos
          </button>
        </div>

        <!-- Timeline -->
        <div class="info-card timeline-card">
          <h3>📜 Historique</h3>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-marker created"></div>
              <div class="timeline-content">
                <span class="timeline-title">Mission créée</span>
                <span class="timeline-date">{{ mission()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="timeline-item" *ngIf="mission()!.assignedAt">
              <div class="timeline-marker assigned"></div>
              <div class="timeline-content">
                <span class="timeline-title">Assignée à {{ mission()!.assignedEmployeeName }}</span>
                <span class="timeline-date">{{ mission()!.assignedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="timeline-item" *ngIf="mission()!.startedAt">
              <div class="timeline-marker started"></div>
              <div class="timeline-content">
                <span class="timeline-title">Intervention démarrée</span>
                <span class="timeline-date">{{ mission()!.startedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="timeline-item" *ngIf="mission()!.completedAt">
              <div class="timeline-marker completed"></div>
              <div class="timeline-content">
                <span class="timeline-title">Intervention terminée</span>
                <span class="timeline-date">{{ mission()!.completedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="timeline-item" *ngIf="mission()!.approvedAt">
              <div class="timeline-marker approved"></div>
              <div class="timeline-content">
                <span class="timeline-title">Approuvée par {{ mission()!.approvedByName }}</span>
                <span class="timeline-date">{{ mission()!.approvedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        @switch (mission()!.status) {
          @case ('PENDING') {
            <button class="btn btn-primary" *ngIf="isSupervisor()" (click)="openAssignModal()">
              👤 Assigner
            </button>
          }
          @case ('ASSIGNED') {
            <button class="btn btn-primary" *ngIf="isAssignedToMe()" (click)="startMission()">
              ▶️ Démarrer
            </button>
          }
          @case ('IN_PROGRESS') {
            <button class="btn btn-success" *ngIf="isAssignedToMe()" (click)="completeMission()">
              ✅ Terminer
            </button>
          }
          @case ('AWAITING_APPROVAL') {
            <button class="btn btn-success" *ngIf="isSupervisor()" (click)="approveMission()">
              ✅ Approuver
            </button>
            <button class="btn btn-danger" *ngIf="isSupervisor()" (click)="rejectMission()">
              ❌ Rejeter
            </button>
          }
        }
        
        <button class="btn btn-danger" *ngIf="canCancel()" (click)="cancelMission()">
          🚫 Annuler
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="isLoading()">
      <div class="spinner-large"></div>
      <p>Chargement de la mission...</p>
    </div>
  `,
  styles: [`
    .mission-detail-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .info-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .main-info {
      grid-column: 1 / -1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .mission-badges {
      display: flex;
      gap: 0.5rem;
    }

    .mission-type {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .type-curage { background: rgba(30, 136, 229, 0.1); color: var(--primary-color); }
    .type-inspection { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .type-debouchage { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .type-pompage { background: rgba(0, 150, 136, 0.1); color: #00897b; }
    .type-maintenance { background: rgba(96, 125, 139, 0.1); color: #546e7a; }
    .type-urgence { background: rgba(244, 67, 54, 0.1); color: #e53935; }

    .mission-priority {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .priority-low { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .priority-medium { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .priority-high { background: rgba(244, 67, 54, 0.1); color: var(--danger-color); }
    .priority-urgent { background: #b71c1c; color: white; }

    .mission-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
    }

    .status-pending { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .status-assigned { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
    .status-in_progress { background: rgba(30, 136, 229, 0.1); color: var(--primary-color); }
    .status-completed { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .status-awaiting_approval { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .status-approved { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }

    .mission-title {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .mission-description {
      color: var(--text-light);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--background-color);
      border-radius: 12px;
    }

    .info-icon {
      font-size: 1.5rem;
    }

    .info-content {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-weight: 600;
      color: var(--text-color);
    }

    /* Checklist */
    .checklist-card h3 {
      margin-bottom: 1rem;
      color: var(--text-color);
    }

    .checklist {
      margin-bottom: 1rem;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: background var(--transition-speed) ease;
    }

    .checklist-item:hover {
      background: var(--background-color);
    }

    .checklist-item.completed span {
      text-decoration: line-through;
      color: var(--text-light);
    }

    .checklist-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: var(--success-color);
    }

    .checklist-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--success-color);
      transition: width 0.3s ease;
    }

    .checklist-progress span {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    /* Photos */
    .photos-card h3 {
      margin-bottom: 1.5rem;
    }

    .photos-section {
      margin-bottom: 1.5rem;
    }

    .photos-section h4 {
      font-size: 0.875rem;
      color: var(--text-light);
      margin-bottom: 0.75rem;
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5rem;
    }

    .photo-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 0.5rem;
    }

    .photo-time {
      font-size: 0.625rem;
      color: white;
    }

    .no-photos {
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .upload-btn {
      width: 100%;
    }

    /* Timeline */
    .timeline-card h3 {
      margin-bottom: 1.5rem;
    }

    .timeline {
      position: relative;
      padding-left: 1.5rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border-color);
    }

    .timeline-item {
      position: relative;
      padding-bottom: 1.5rem;
    }

    .timeline-marker {
      position: absolute;
      left: -1.5rem;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .timeline-marker.created { background: var(--primary-color); }
    .timeline-marker.assigned { background: #1976d2; }
    .timeline-marker.started { background: var(--warning-color); }
    .timeline-marker.completed { background: var(--success-color); }
    .timeline-marker.approved { background: #4caf50; }

    .timeline-content {
      display: flex;
      flex-direction: column;
    }

    .timeline-title {
      font-weight: 500;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .timeline-date {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    /* Action Bar */
    .action-bar {
      position: fixed;
      bottom: 0;
      left: 260px;
      right: 0;
      background: white;
      padding: 1rem 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
      z-index: 100;
    }

    /* Loading */
    .loading-state {
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

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .action-bar {
        left: 0;
      }
    }
  `]
})
export class MissionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly missionService = inject(MissionService);
  private readonly photoService = inject(PhotoService);
  private readonly authService = inject(AuthService);

  mission = signal<Mission | null>(null);
  beforePhotos = signal<Photo[]>([]);
  afterPhotos = signal<Photo[]>([]);
  isLoading = signal(true);

  isSupervisor = this.authService.isSupervisor;
  currentEmployee = this.authService.currentEmployee;

  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_PRIORITY_LABELS = MISSION_PRIORITY_LABELS;

  ngOnInit(): void {
    const missionId = this.route.snapshot.params['id'];
    if (missionId) {
      this.loadMission(+missionId);
    }
  }

  loadMission(id: number): void {
    this.isLoading.set(true);
    this.missionService.getMission(id).subscribe({
      next: (mission) => {
        this.mission.set(mission);
        this.loadPhotos(id);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load mission:', err);
        this.isLoading.set(false);
        this.router.navigate(['/missions']);
      }
    });
  }

  loadPhotos(missionId: number): void {
    this.photoService.getBeforePhotos(missionId).subscribe({
      next: (photos) => this.beforePhotos.set(photos)
    });
    this.photoService.getAfterPhotos(missionId).subscribe({
      next: (photos) => this.afterPhotos.set(photos)
    });
  }

  checklistProgress(): number {
    const checklist = this.mission()?.checklist;
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  }

  getPhotoUrl(photoId: number): string {
    return this.photoService.getPhotoUrl(photoId);
  }

  isAssignedToMe(): boolean {
    const mission = this.mission();
    const employee = this.currentEmployee();
    return mission?.assignedEmployeeId === employee?.id;
  }

  canEdit(): boolean {
    return this.isAssignedToMe() && this.mission()?.status === 'IN_PROGRESS';
  }

  canUploadPhotos(): boolean {
    return this.isAssignedToMe() && ['ASSIGNED', 'IN_PROGRESS'].includes(this.mission()?.status || '');
  }

  canCancel(): boolean {
    return this.isSupervisor() && !['COMPLETED', 'APPROVED', 'CANCELLED'].includes(this.mission()?.status || '');
  }

  toggleChecklistItem(item: any): void {
    this.missionService.updateChecklist(this.mission()!.id, item.id, !item.completed).subscribe({
      next: () => {
        item.completed = !item.completed;
        this.mission.set({...this.mission()!});
      }
    });
  }

  startMission(): void {
    this.missionService.updateStatus(this.mission()!.id, 'IN_PROGRESS').subscribe({
      next: (mission) => this.mission.set(mission)
    });
  }

  completeMission(): void {
    this.missionService.updateStatus(this.mission()!.id, 'AWAITING_APPROVAL').subscribe({
      next: (mission) => this.mission.set(mission)
    });
  }

  approveMission(): void {
    this.missionService.approveMission(this.mission()!.id).subscribe({
      next: (mission) => this.mission.set(mission)
    });
  }

  rejectMission(): void {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      this.missionService.rejectMission(this.mission()!.id, reason).subscribe({
        next: (mission) => this.mission.set(mission)
      });
    }
  }

  cancelMission(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette mission?')) {
      this.missionService.updateStatus(this.mission()!.id, 'CANCELLED').subscribe({
        next: (mission) => this.mission.set(mission)
      });
    }
  }

  openPhoto(photo: Photo): void {
    window.open(this.getPhotoUrl(photo.id), '_blank');
  }

  openAssignModal(): void {
    // Would open a modal to select employee
    console.log('Open assign modal');
  }

  openPhotoUpload(): void {
    // Would open a file upload dialog
    console.log('Open photo upload');
  }
}
