import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { MissionService } from '../../../core/services/mission.service';
import { Employee } from '../../../core/models/user.model';
import { Mission, MISSION_TYPE_LABELS, MISSION_STATUS_LABELS } from '../../../core/models/mission.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="employee-detail-page" *ngIf="employee()">
      <!-- Back Button -->
      <a routerLink="/employees" class="back-link">← Retour aux employés</a>

      <!-- Header -->
      <div class="employee-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="employee-avatar" [style.background-color]="getAvatarColor()">
            {{ getInitials() }}
          </div>
          <div class="employee-info">
            <h1>{{ employee()?.firstName }} {{ employee()?.lastName }}</h1>
            <p class="job-title">{{ employee()?.jobTitle || 'Technicien' }}</p>
            <div class="employee-status">
              <span class="status-badge" [class]="'status-' + employee()?.status?.toLowerCase()">
                {{ getStatusLabel() }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="assignMission()">
              Assigner Mission
            </button>
            <button class="btn btn-primary" (click)="editEmployee()">
              Modifier
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content-grid">
        <!-- Contact Info -->
        <div class="info-card">
          <h2>📇 Contact</h2>
          <div class="info-list">
            <div class="info-item">
              <span class="info-icon">📧</span>
              <div>
                <span class="info-label">Email</span>
                <span class="info-value">{{ employee()?.email }}</span>
              </div>
            </div>
            <div class="info-item" *ngIf="employee()?.phone">
              <span class="info-icon">📱</span>
              <div>
                <span class="info-label">Téléphone</span>
                <span class="info-value">{{ employee()?.phone }}</span>
              </div>
            </div>
            <div class="info-item" *ngIf="employee()?.hireDate">
              <span class="info-icon">📅</span>
              <div>
                <span class="info-label">Date d'embauche</span>
                <span class="info-value">{{ employee()?.hireDate | date:'dd MMMM yyyy':'':'fr-FR' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="info-card stats-card">
          <h2>📊 Statistiques</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-value">{{ employee()?.totalPoints || 0 }}</span>
              <span class="stat-label">🏆 Points</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ employee()?.completedMissions || 0 }}</span>
              <span class="stat-label">✅ Missions</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">#{{ employee()?.leaderboardRank || '-' }}</span>
              <span class="stat-label">📍 Rang</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ employee()?.avgRating?.toFixed(1) || '-' }}</span>
              <span class="stat-label">⭐ Note</span>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="info-card skills-card" *ngIf="employee()?.skills?.length">
          <h2>🛠️ Compétences</h2>
          <div class="skills-list">
            @for (skill of employee()?.skills; track skill) {
              <span class="skill-tag">{{ skill }}</span>
            }
          </div>
        </div>

        <!-- Recent Missions -->
        <div class="info-card missions-card">
          <h2>🎯 Missions Récentes</h2>
          <div class="missions-list" *ngIf="recentMissions().length > 0">
            @for (mission of recentMissions(); track mission.id) {
              <a [routerLink]="['/missions', mission.id]" class="mission-item">
                <div class="mission-icon">{{ getMissionIcon(mission.type) }}</div>
                <div class="mission-info">
                  <span class="mission-title">{{ mission.title }}</span>
                  <span class="mission-meta">
                    {{ MISSION_TYPE_LABELS[mission.type] }} • {{ mission.scheduledDate | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                <span class="mission-status" [class]="'status-' + mission.status.toLowerCase()">
                  {{ MISSION_STATUS_LABELS[mission.status] }}
                </span>
              </a>
            }
          </div>
          <div class="empty-mini" *ngIf="recentMissions().length === 0">
            <p>Aucune mission récente</p>
          </div>
        </div>

        <!-- Performance Chart Placeholder -->
        <div class="info-card performance-card">
          <h2>📈 Performance</h2>
          <div class="performance-placeholder">
            <div class="performance-bars">
              <div class="bar">
                <span class="bar-label">Missions</span>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="getMissionsPercentage()"></div>
                </div>
                <span class="bar-value">{{ employee()?.completedMissions || 0 }}</span>
              </div>
              <div class="bar">
                <span class="bar-label">Points</span>
                <div class="bar-track">
                  <div class="bar-fill points" [style.width.%]="getPointsPercentage()"></div>
                </div>
                <span class="bar-value">{{ employee()?.totalPoints || 0 }}</span>
              </div>
              <div class="bar">
                <span class="bar-label">Qualité</span>
                <div class="bar-track">
                  <div class="bar-fill quality" [style.width.%]="getQualityPercentage()"></div>
                </div>
                <span class="bar-value">{{ (employee()?.avgRating || 0) * 20 | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="isLoading()">
      <div class="spinner-large"></div>
      <p>Chargement...</p>
    </div>

    <!-- Not Found -->
    <div class="error-state" *ngIf="!isLoading() && !employee()">
      <span class="error-icon">😕</span>
      <h2>Employé non trouvé</h2>
      <a routerLink="/employees" class="btn btn-primary">Retour aux employés</a>
    </div>
  `,
  styles: [`
    .employee-detail-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-link {
      display: inline-block;
      color: var(--primary-color);
      text-decoration: none;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    /* Header */
    .employee-header {
      position: relative;
      margin-bottom: 2rem;
    }

    .header-background {
      height: 160px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      border-radius: 16px;
    }

    .header-content {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 1.5rem;
      padding: 0 2rem;
      margin-top: -50px;
    }

    .employee-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      box-shadow: var(--shadow-lg);
      border: 4px solid white;
      flex-shrink: 0;
    }

    .employee-info {
      flex: 1;
      padding-bottom: 0.5rem;
    }

    .employee-info h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .job-title {
      color: var(--text-light);
      margin-bottom: 0.5rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-available, .status-active { 
      background: rgba(76, 175, 80, 0.1); 
      color: var(--success-color); 
    }
    .status-busy, .status-on_mission { 
      background: rgba(255, 152, 0, 0.1); 
      color: #f57c00; 
    }
    .status-absent, .status-unavailable { 
      background: rgba(244, 67, 54, 0.1); 
      color: var(--danger-color); 
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .info-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .info-card h2 {
      font-size: 1rem;
      color: var(--text-color);
      margin-bottom: 1.5rem;
    }

    /* Contact Info */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-icon {
      font-size: 1.25rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-color);
      border-radius: 10px;
    }

    .info-item > div {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .info-value {
      font-weight: 500;
      color: var(--text-color);
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-box {
      text-align: center;
      padding: 1rem;
      background: var(--background-color);
      border-radius: 12px;
    }

    .stat-box .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      display: block;
    }

    .stat-box .stat-label {
      font-size: 0.75rem;
      color: var(--text-light);
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

    /* Missions */
    .missions-card {
      grid-column: span 2;
    }

    .missions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .mission-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--background-color);
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .mission-item:hover {
      background: rgba(30, 136, 229, 0.1);
    }

    .mission-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 10px;
    }

    .mission-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .mission-title {
      font-weight: 500;
      color: var(--text-color);
    }

    .mission-meta {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .mission-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .mission-status.status-completed { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .mission-status.status-in_progress { background: rgba(33, 150, 243, 0.1); color: #2196F3; }
    .mission-status.status-pending { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .mission-status.status-cancelled { background: rgba(158, 158, 158, 0.1); color: #757575; }

    /* Performance */
    .performance-card {
      grid-column: span 2;
    }

    .performance-bars {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .bar-label {
      width: 80px;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .bar-track {
      flex: 1;
      height: 12px;
      background: var(--background-color);
      border-radius: 6px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    .bar-fill.points {
      background: linear-gradient(90deg, #ffc107, #ff9800);
    }

    .bar-fill.quality {
      background: linear-gradient(90deg, #4caf50, #8bc34a);
    }

    .bar-value {
      width: 60px;
      text-align: right;
      font-weight: 600;
      color: var(--text-color);
    }

    /* States */
    .loading-state, .error-state {
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

    .error-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .empty-mini {
      text-align: center;
      padding: 2rem;
      color: var(--text-light);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .missions-card, .performance-card {
        grid-column: span 1;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private missionService = inject(MissionService);

  employee = signal<Employee | null>(null);
  recentMissions = signal<Mission[]>([]);
  isLoading = signal(true);

  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(+id);
    }
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.loadRecentMissions(id);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load employee:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadRecentMissions(employeeId: number): void {
    this.missionService.getMissionsByEmployee(employeeId).subscribe({
      next: (missions) => this.recentMissions.set(missions.slice(0, 5)),
      error: (err: unknown) => console.error('Failed to load missions:', err)
    });
  }

  getInitials(): string {
    const emp = this.employee();
    if (!emp) return '?';
    const first = emp.firstName ?? emp.user?.firstName ?? '';
    const last = emp.lastName ?? emp.user?.lastName ?? '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(): string {
    const colors = ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#e53935', '#00acc1'];
    const emp = this.employee();
    if (!emp) return colors[0];
    const first = emp.firstName ?? emp.user?.firstName ?? 'A';
    const last = emp.lastName ?? emp.user?.lastName ?? 'A';
    const index = (first.charCodeAt(0) + last.charCodeAt(0)) % colors.length;
    return colors[index];
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      'AVAILABLE': 'Disponible',
      'ON_MISSION': 'En mission',
      'ABSENT': 'Absent',
      'UNAVAILABLE': 'Indisponible',
      'ACTIVE': 'Actif',
      'BUSY': 'Occupé'
    };
    return labels[this.employee()?.status || ''] || this.employee()?.status || 'Inconnu';
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

  getMissionsPercentage(): number {
    const completed = this.employee()?.completedMissions || 0;
    return Math.min((completed / 50) * 100, 100); // Assume 50 missions as "full"
  }

  getPointsPercentage(): number {
    const points = this.employee()?.totalPoints || 0;
    return Math.min((points / 1000) * 100, 100); // Assume 1000 points as "full"
  }

  getQualityPercentage(): number {
    const rating = this.employee()?.avgRating || 0;
    return rating * 20; // 5-star rating to percentage
  }

  editEmployee(): void {
    alert('Fonctionnalité de modification à implémenter');
  }

  assignMission(): void {
    this.router.navigate(['/missions/new'], { 
      queryParams: { employeeId: this.employee()?.id } 
    });
  }
}
