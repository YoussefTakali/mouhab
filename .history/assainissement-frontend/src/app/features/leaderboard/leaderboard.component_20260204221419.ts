import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { Leaderboard, LeaderboardEntry } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leaderboard-page">
      <div class="page-header">
        <div class="header-content">
          <h1>🏆 Classement</h1>
          <p>Les meilleurs performers de l'équipe</p>
        </div>
        
        <div class="period-selector">
          <button 
            class="period-btn" 
            [class.active]="selectedPeriod === 'weekly'"
            (click)="changePeriod('weekly')"
          >
            Semaine
          </button>
          <button 
            class="period-btn" 
            [class.active]="selectedPeriod === 'monthly'"
            (click)="changePeriod('monthly')"
          >
            Mois
          </button>
          <button 
            class="period-btn" 
            [class.active]="selectedPeriod === 'yearly'"
            (click)="changePeriod('yearly')"
          >
            Année
          </button>
          <button 
            class="period-btn" 
            [class.active]="selectedPeriod === 'all'"
            (click)="changePeriod('all')"
          >
            Tout
          </button>
        </div>
      </div>

      <!-- Top 3 Podium -->
      <div class="podium-section" *ngIf="!isLoading() && leaderboard().length >= 3">
        <div class="podium">
          <div class="podium-place second">
            <div class="avatar silver">
              {{ getInitials(leaderboard()[1]) }}
            </div>
            <div class="place-number">2</div>
            <div class="performer-name">{{ leaderboard()[1].employeeName }}</div>
            <div class="performer-points">{{ leaderboard()[1].points }} pts</div>
            <div class="performer-missions">{{ leaderboard()[1].missionsCompleted }} missions</div>
          </div>

          <div class="podium-place first">
            <div class="crown">👑</div>
            <div class="avatar gold">
              {{ getInitials(leaderboard()[0]) }}
            </div>
            <div class="place-number">1</div>
            <div class="performer-name">{{ leaderboard()[0].employeeName }}</div>
            <div class="performer-points">{{ leaderboard()[0].points }} pts</div>
            <div class="performer-missions">{{ leaderboard()[0].missionsCompleted }} missions</div>
          </div>

          <div class="podium-place third">
            <div class="avatar bronze">
              {{ getInitials(leaderboard()[2]) }}
            </div>
            <div class="place-number">3</div>
            <div class="performer-name">{{ leaderboard()[2].employeeName }}</div>
            <div class="performer-points">{{ leaderboard()[2].points }} pts</div>
            <div class="performer-missions">{{ leaderboard()[2].missionsCompleted }} missions</div>
          </div>
        </div>
      </div>

      <!-- Your Position -->
      <div class="your-position-card" *ngIf="myPosition()">
        <div class="position-icon">📍</div>
        <div class="position-content">
          <span class="position-label">Votre Position</span>
          <span class="position-rank">#{{ myPosition()!.rank }}</span>
        </div>
        <div class="position-stats">
          <span class="stat-value">{{ myPosition()!.points }}</span>
          <span class="stat-label">points</span>
        </div>
        <div class="position-stats">
          <span class="stat-value">{{ myPosition()!.missionsCompleted }}</span>
          <span class="stat-label">missions</span>
        </div>
      </div>

      <!-- Full Leaderboard -->
      <div class="leaderboard-card">
        <div class="card-header">
          <h2>Classement Complet</h2>
          <span class="total-count">{{ leaderboard().length }} participants</span>
        </div>

        <div class="leaderboard-list" *ngIf="!isLoading()">
          @for (entry of leaderboard(); track entry.employeeId; let i = $index) {
            <div 
              class="leaderboard-row" 
              [class.highlight]="entry.employeeId === currentEmployeeId()"
              [class.top-three]="i < 3"
            >
              <div class="rank-cell">
                @if (i === 0) {
                  <span class="rank-medal gold">🥇</span>
                } @else if (i === 1) {
                  <span class="rank-medal silver">🥈</span>
                } @else if (i === 2) {
                  <span class="rank-medal bronze">🥉</span>
                } @else {
                  <span class="rank-number">{{ i + 1 }}</span>
                }
              </div>

              <div class="employee-cell">
                <div class="employee-avatar" [class]="getRankClass(i)">
                  {{ getInitials(entry) }}
                </div>
                <div class="employee-info">
                  <span class="employee-name">{{ entry.employeeName }}</span>
                  <span class="employee-title" *ngIf="entry.title">{{ entry.title }}</span>
                </div>
              </div>

              <div class="stats-cell">
                <div class="stat">
                  <span class="stat-value">{{ entry.missionsCompleted }}</span>
                  <span class="stat-label">missions</span>
                </div>
                <div class="stat" *ngIf="entry.avgRating">
                  <span class="stat-value">{{ entry.avgRating.toFixed(1) }}</span>
                  <span class="stat-label">note</span>
                </div>
              </div>

              <div class="points-cell">
                <span class="points-value">{{ entry.points }}</span>
                <span class="points-label">pts</span>
              </div>

              <div class="trend-cell" *ngIf="entry.trendDirection">
                <span class="trend" [class]="'trend-' + entry.trendDirection">
                  {{ entry.trendDirection === 'up' ? '↑' : entry.trendDirection === 'down' ? '↓' : '→' }}
                  {{ entry.positionsChanged || 0 }}
                </span>
              </div>
            </div>
          }
        </div>

        <div class="loading-state" *ngIf="isLoading()">
          <div class="spinner-large"></div>
          <p>Chargement du classement...</p>
        </div>

        <div class="empty-state" *ngIf="!isLoading() && leaderboard().length === 0">
          <span class="empty-icon">🏆</span>
          <h3>Aucun classement disponible</h3>
          <p>Complétez des missions pour apparaître dans le classement</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-title">Missions Totales</span>
            <span class="stat-value-large">{{ totalMissions() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <span class="stat-title">Points Distribués</span>
            <span class="stat-value-large">{{ totalPoints() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-title">Moyenne par Personne</span>
            <span class="stat-value-large">{{ averagePoints() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
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

    .period-selector {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 0.25rem;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }

    .period-btn {
      padding: 0.625rem 1.25rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-speed) ease;
    }

    .period-btn:hover {
      background: var(--background-color);
    }

    .period-btn.active {
      background: var(--primary-color);
      color: white;
    }

    /* Podium */
    .podium-section {
      margin-bottom: 2rem;
    }

    .podium {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 1rem;
      padding: 2rem 1rem;
    }

    .podium-place {
      text-align: center;
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      position: relative;
      transition: transform var(--transition-speed) ease;
    }

    .podium-place:hover {
      transform: translateY(-4px);
    }

    .podium-place.first {
      padding-bottom: 3rem;
      margin-bottom: -1rem;
    }

    .podium-place.second,
    .podium-place.third {
      padding-bottom: 2rem;
    }

    .crown {
      font-size: 2rem;
      position: absolute;
      top: -1.5rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin: 0 auto 0.75rem;
    }

    .avatar.gold { background: linear-gradient(135deg, #ffd700, #ffb300); }
    .avatar.silver { background: linear-gradient(135deg, #c0c0c0, #9e9e9e); }
    .avatar.bronze { background: linear-gradient(135deg, #cd7f32, #a0522d); }

    .place-number {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .performer-name {
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .performer-points {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .performer-missions {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    /* Your Position */
    .your-position-card {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: 16px;
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      color: white;
    }

    .position-icon {
      font-size: 2rem;
    }

    .position-content {
      flex: 1;
    }

    .position-label {
      display: block;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .position-rank {
      font-size: 2rem;
      font-weight: 700;
    }

    .position-stats {
      text-align: center;
    }

    .position-stats .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .position-stats .stat-label {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    /* Leaderboard Card */
    .leaderboard-card {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .card-header h2 {
      font-size: 1.125rem;
      color: var(--text-color);
      margin: 0;
    }

    .total-count {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .leaderboard-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .leaderboard-row {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      transition: background var(--transition-speed) ease;
    }

    .leaderboard-row:hover {
      background: var(--background-color);
    }

    .leaderboard-row.highlight {
      background: rgba(30, 136, 229, 0.05);
    }

    .leaderboard-row.top-three {
      background: linear-gradient(90deg, rgba(255, 215, 0, 0.05), transparent);
    }

    .rank-cell {
      width: 50px;
      text-align: center;
    }

    .rank-medal {
      font-size: 1.5rem;
    }

    .rank-number {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-light);
    }

    .employee-cell {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .employee-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: white;
      background: var(--primary-color);
    }

    .employee-avatar.gold { background: linear-gradient(135deg, #ffd700, #ffb300); }
    .employee-avatar.silver { background: linear-gradient(135deg, #c0c0c0, #9e9e9e); }
    .employee-avatar.bronze { background: linear-gradient(135deg, #cd7f32, #a0522d); }

    .employee-info {
      display: flex;
      flex-direction: column;
    }

    .employee-name {
      font-weight: 600;
      color: var(--text-color);
    }

    .employee-title {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .stats-cell {
      display: flex;
      gap: 2rem;
    }

    .stat {
      text-align: center;
    }

    .stat .stat-value {
      display: block;
      font-weight: 600;
      color: var(--text-color);
    }

    .stat .stat-label {
      font-size: 0.625rem;
      color: var(--text-light);
      text-transform: uppercase;
    }

    .points-cell {
      width: 100px;
      text-align: right;
    }

    .points-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .points-label {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-left: 0.25rem;
    }

    .trend-cell {
      width: 60px;
      text-align: center;
    }

    .trend {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .trend-up { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .trend-down { background: rgba(244, 67, 54, 0.1); color: var(--danger-color); }
    .trend-same { background: var(--background-color); color: var(--text-light); }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }

    .stat-card .stat-icon {
      font-size: 2rem;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-title {
      font-size: 0.75rem;
      color: var(--text-light);
      text-transform: uppercase;
    }

    .stat-value-large {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
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
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .podium {
        flex-direction: column;
        align-items: center;
      }

      .podium-place.first {
        order: -1;
        margin-bottom: 1rem;
      }

      .your-position-card {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .stats-cell {
        display: none;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  leaderboard = signal<LeaderboardEntry[]>([]);
  myPosition = signal<LeaderboardEntry | null>(null);
  isLoading = signal(true);
  selectedPeriod = 'monthly';

  currentEmployeeId = () => this.authService.currentEmployee()?.id;

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.isLoading.set(true);
    this.employeeService.getLeaderboard(this.selectedPeriod).subscribe({
      next: (data) => {
        this.leaderboard.set(data.entries);
        const myId = this.currentEmployeeId();
        if (myId) {
          const myEntry = data.entries.find(e => e.employeeId === myId);
          if (myEntry) {
            this.myPosition.set({
              ...myEntry,
              rank: data.entries.indexOf(myEntry) + 1
            });
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load leaderboard:', err);
        this.isLoading.set(false);
      }
    });
  }

  getInitials(entry: LeaderboardEntry): string {
    const names = entry.employeeName.split(' ');
    return names.map(n => n.charAt(0).toUpperCase()).slice(0, 2).join('');
  }

  getRankClass(index: number): string {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  }

  totalMissions(): number {
    return this.leaderboard().reduce((sum, e) => sum + e.missionsCompleted, 0);
  }

  totalPoints(): number {
    return this.leaderboard().reduce((sum, e) => sum + e.points, 0);
  }

  averagePoints(): number {
    const entries = this.leaderboard();
    if (entries.length === 0) return 0;
    return Math.round(this.totalPoints() / entries.length);
  }
}
