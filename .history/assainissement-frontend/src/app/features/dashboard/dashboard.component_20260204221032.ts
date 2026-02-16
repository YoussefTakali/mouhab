import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { MissionService } from '../../core/services/mission.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { Mission, MISSION_STATUS_LABELS, MISSION_PRIORITY_LABELS } from '../../core/models/mission.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h2>Bonjour, {{ currentUser()?.firstName }}! 👋</h2>
          <p>Voici un aperçu de votre activité</p>
        </div>
        <div class="date-display">
          <span class="date">{{ today | date:'EEEE d MMMM yyyy':'':'fr-FR' }}</span>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon missions">📋</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.totalMissions || 0 }}</span>
              <span class="stat-label">Missions Totales</span>
            </div>
            <div class="stat-trend up" *ngIf="stats()?.missionsCompletedThisMonth">
              +{{ stats()?.missionsCompletedThisMonth }} ce mois
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending">⏳</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.pendingMissions || 0 }}</span>
              <span class="stat-label">Missions En Attente</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon progress">🔄</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.inProgressMissions || 0 }}</span>
              <span class="stat-label">En Cours</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon completed">✅</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.completedMissions || 0 }}</span>
              <span class="stat-label">Terminées</span>
            </div>
          </div>

          <div class="stat-card points-card">
            <div class="stat-icon points">🏆</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.totalPoints || 0 }}</span>
              <span class="stat-label">Points Gagnés</span>
            </div>
            <div class="stat-rank" *ngIf="stats()?.leaderboardPosition">
              Rang #{{ stats()?.leaderboardPosition }}
            </div>
          </div>

          <div class="stat-card" *ngIf="isSupervisor()">
            <div class="stat-icon team">👥</div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.activeEmployees || 0 }}</span>
              <span class="stat-label">Employés Actifs</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h3>Actions Rapides</h3>
        <div class="actions-grid">
          <a routerLink="/missions/new" class="action-card" *ngIf="isSupervisor()">
            <span class="action-icon">➕</span>
            <span class="action-label">Nouvelle Mission</span>
          </a>
          <a routerLink="/missions" class="action-card">
            <span class="action-icon">📋</span>
            <span class="action-label">Voir Missions</span>
          </a>
          <a routerLink="/calendar" class="action-card">
            <span class="action-icon">📅</span>
            <span class="action-label">Calendrier</span>
          </a>
          <a routerLink="/absences/new" class="action-card">
            <span class="action-icon">🏖️</span>
            <span class="action-label">Demander Congé</span>
          </a>
          <a routerLink="/leaderboard" class="action-card">
            <span class="action-icon">🏆</span>
            <span class="action-label">Classement</span>
          </a>
          <a routerLink="/approvals" class="action-card" *ngIf="isSupervisor()">
            <span class="action-icon">✅</span>
            <span class="action-label">Approbations</span>
            <span class="action-badge" *ngIf="pendingApprovalsCount() > 0">{{ pendingApprovalsCount() }}</span>
          </a>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Today's Missions -->
        <section class="dashboard-card missions-today">
          <div class="card-header">
            <h3>📋 Missions du Jour</h3>
            <a routerLink="/missions" class="view-all">Voir tout →</a>
          </div>
          <div class="card-content">
            @if (todayMissions().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">🎉</span>
                <p>Aucune mission prévue aujourd'hui</p>
              </div>
            } @else {
              <div class="missions-list">
                @for (mission of todayMissions(); track mission.id) {
                  <a [routerLink]="['/missions', mission.id]" class="mission-item">
                    <div class="mission-priority" [class]="'priority-' + mission.priority.toLowerCase()"></div>
                    <div class="mission-info">
                      <h4>{{ mission.title }}</h4>
                      <p>{{ mission.clientName }} - {{ mission.address }}</p>
                    </div>
                    <div class="mission-meta">
                      <span class="mission-time">{{ mission.scheduledDate | date:'HH:mm' }}</span>
                      <span class="mission-status" [class]="'status-' + mission.status.toLowerCase()">
                        {{ MISSION_STATUS_LABELS[mission.status] }}
                      </span>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </section>

        <!-- Urgent Missions -->
        <section class="dashboard-card urgent-missions" *ngIf="urgentMissions().length > 0">
          <div class="card-header">
            <h3>🚨 Missions Urgentes</h3>
          </div>
          <div class="card-content">
            <div class="missions-list">
              @for (mission of urgentMissions(); track mission.id) {
                <a [routerLink]="['/missions', mission.id]" class="mission-item urgent">
                  <div class="mission-priority priority-high"></div>
                  <div class="mission-info">
                    <h4>{{ mission.title }}</h4>
                    <p>{{ mission.clientName }} - {{ mission.address }}</p>
                  </div>
                  <div class="mission-meta">
                    <span class="mission-status" [class]="'status-' + mission.status.toLowerCase()">
                      {{ MISSION_STATUS_LABELS[mission.status] }}
                    </span>
                  </div>
                </a>
              }
            </div>
          </div>
        </section>

        <!-- Awaiting Approval (Supervisor only) -->
        <section class="dashboard-card awaiting-approval" *ngIf="isSupervisor() && awaitingApproval().length > 0">
          <div class="card-header">
            <h3>⏳ En Attente d'Approbation</h3>
            <a routerLink="/approvals" class="view-all">Voir tout →</a>
          </div>
          <div class="card-content">
            <div class="missions-list">
              @for (mission of awaitingApproval(); track mission.id) {
                <a [routerLink]="['/missions', mission.id]" class="mission-item">
                  <div class="mission-info">
                    <h4>{{ mission.title }}</h4>
                    <p>{{ mission.assignedEmployeeName }} - {{ mission.completedAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  <button class="btn btn-sm btn-primary" (click)="$event.preventDefault(); $event.stopPropagation()">
                    Examiner
                  </button>
                </a>
              }
            </div>
          </div>
        </section>

        <!-- Leaderboard Preview -->
        <section class="dashboard-card leaderboard-preview">
          <div class="card-header">
            <h3>🏆 Top Performers</h3>
            <a routerLink="/leaderboard" class="view-all">Voir classement →</a>
          </div>
          <div class="card-content">
            <div class="leaderboard-list">
              @for (entry of topPerformers(); track entry.employeeId; let i = $index) {
                <div class="leaderboard-item">
                  <span class="rank" [class]="'rank-' + (i + 1)">{{ i + 1 }}</span>
                  <div class="performer-info">
                    <span class="performer-name">{{ entry.employeeName }}</span>
                    <span class="performer-missions">{{ entry.missionsCompleted }} missions</span>
                  </div>
                  <span class="performer-points">{{ entry.points }} pts</span>
                </div>
              }
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .welcome-content h2 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .welcome-content p {
      color: var(--text-light);
    }

    .date-display .date {
      font-size: 1.125rem;
      color: var(--text-light);
      text-transform: capitalize;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon.missions { background: rgba(30, 136, 229, 0.1); }
    .stat-icon.pending { background: rgba(255, 152, 0, 0.1); }
    .stat-icon.progress { background: rgba(33, 150, 243, 0.1); }
    .stat-icon.completed { background: rgba(76, 175, 80, 0.1); }
    .stat-icon.points { background: rgba(156, 39, 176, 0.1); }
    .stat-icon.team { background: rgba(0, 150, 136, 0.1); }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .stat-trend {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      width: fit-content;
    }

    .stat-trend.up {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success-color);
    }

    .stat-rank {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    /* Quick Actions */
    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      color: var(--text-color);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-speed) ease;
      position: relative;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      background: var(--primary-color);
    }

    .action-card:hover .action-icon,
    .action-card:hover .action-label {
      color: white;
    }

    .action-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .action-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .action-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--danger-color);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      min-width: 20px;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .dashboard-card {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .card-header h3 {
      font-size: 1rem;
      color: var(--text-color);
      margin: 0;
    }

    .view-all {
      font-size: 0.875rem;
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .card-content {
      padding: 1rem 1.5rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-light);
    }

    /* Missions List */
    .missions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .mission-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem;
      background: var(--background-color);
      border-radius: 10px;
      text-decoration: none;
      transition: background var(--transition-speed) ease;
    }

    .mission-item:hover {
      background: rgba(30, 136, 229, 0.05);
    }

    .mission-item.urgent {
      border-left: 3px solid var(--danger-color);
    }

    .mission-priority {
      width: 8px;
      height: 40px;
      border-radius: 4px;
    }

    .priority-low { background: var(--success-color); }
    .priority-medium { background: var(--warning-color); }
    .priority-high { background: var(--danger-color); }
    .priority-urgent { background: #b71c1c; }

    .mission-info {
      flex: 1;
      min-width: 0;
    }

    .mission-info h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mission-info p {
      font-size: 0.75rem;
      color: var(--text-light);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mission-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .mission-time {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .mission-status {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .status-pending { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .status-assigned { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
    .status-in_progress { background: rgba(30, 136, 229, 0.1); color: var(--primary-color); }
    .status-completed { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .status-awaiting_approval { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .status-approved { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }

    /* Leaderboard */
    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--background-color);
      border-radius: 10px;
    }

    .rank {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      background: var(--border-color);
      color: var(--text-color);
    }

    .rank-1 { background: linear-gradient(135deg, #ffd700, #ffb300); color: white; }
    .rank-2 { background: linear-gradient(135deg, #c0c0c0, #9e9e9e); color: white; }
    .rank-3 { background: linear-gradient(135deg, #cd7f32, #a0522d); color: white; }

    .performer-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .performer-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .performer-missions {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .performer-points {
      font-weight: 700;
      color: var(--primary-color);
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .welcome-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .actions-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private missionService = inject(MissionService);

  currentUser = this.authService.currentUser;
  isSupervisor = this.authService.isSupervisor;

  today = new Date();

  stats = signal<DashboardStats | null>(null);
  todayMissions = signal<Mission[]>([]);
  urgentMissions = signal<Mission[]>([]);
  awaitingApproval = signal<Mission[]>([]);
  topPerformers = signal<any[]>([]);
  pendingApprovalsCount = computed(() => this.awaitingApproval().length);

  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  MISSION_PRIORITY_LABELS = MISSION_PRIORITY_LABELS;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load stats
    this.dashboardService.getMyDashboardStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Failed to load stats:', err)
    });

    // Load today's missions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    this.missionService.getMissionsForCalendar(startOfDay, endOfDay).subscribe({
      next: (missions) => this.todayMissions.set(missions.slice(0, 5)),
      error: (err) => console.error('Failed to load today missions:', err)
    });

    // Load urgent missions
    this.missionService.getUrgentMissions().subscribe({
      next: (missions) => this.urgentMissions.set(missions.slice(0, 3)),
      error: (err) => console.error('Failed to load urgent missions:', err)
    });

    // Load awaiting approval (for supervisors)
    if (this.isSupervisor()) {
      this.missionService.getMissionsAwaitingApproval().subscribe({
        next: (missions) => this.awaitingApproval.set(missions.slice(0, 3)),
        error: (err) => console.error('Failed to load awaiting approval:', err)
      });
    }

    // Mock top performers for now
    this.topPerformers.set([
      { employeeId: 1, employeeName: 'Jean Dupont', missionsCompleted: 45, points: 2350 },
      { employeeId: 2, employeeName: 'Marie Martin', missionsCompleted: 42, points: 2180 },
      { employeeId: 3, employeeName: 'Pierre Bernard', missionsCompleted: 38, points: 1920 }
    ]);
  }
}
