import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MissionService } from '../../core/services/mission.service';
import { AuthService } from '../../core/services/auth.service';
import { Mission, MISSION_STATUS_LABELS, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../core/models/mission.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  missions: Mission[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="calendar-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fa-regular fa-calendar-days"></i> Calendrier</h1>
          <p>Planification des missions</p>
        </div>
        <div class="header-actions">
          <a routerLink="/missions/new" class="btn btn-primary" *ngIf="isSupervisor()">
            <i class="fa-solid fa-plus"></i> Nouvelle Mission
          </a>
        </div>
      </div>

      <!-- Calendar Navigation -->
      <div class="calendar-nav">
        <button class="nav-btn" (click)="previousMonth()">← Précédent</button>
        <h2 class="current-month">{{ currentMonthLabel() }}</h2>
        <button class="nav-btn" (click)="nextMonth()">Suivant →</button>
        <button class="nav-btn today-btn" (click)="goToToday()">Aujourd'hui</button>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button 
          class="toggle-btn" 
          [class.active]="viewMode === 'month'"
          (click)="viewMode = 'month'"
        >
          Mois
        </button>
        <button 
          class="toggle-btn" 
          [class.active]="viewMode === 'week'"
          (click)="viewMode = 'week'"
        >
          Semaine
        </button>
      </div>

      <!-- Month View -->
      <div class="calendar-container" *ngIf="viewMode === 'month'">
        <!-- Weekday Headers -->
        <div class="calendar-header">
          @for (day of weekDays; track day) {
            <div class="weekday">{{ day }}</div>
          }
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          @for (day of calendarDays(); track day.date.toISOString()) {
            <div 
              class="calendar-day" 
              [class.other-month]="!day.isCurrentMonth"
              [class.today]="day.isToday"
              [class.has-missions]="day.missions.length > 0"
              (click)="selectDay(day)"
            >
              <span class="day-number">{{ day.date.getDate() }}</span>
              
              <div class="day-missions" *ngIf="day.missions.length > 0">
                @for (mission of day.missions.slice(0, 3); track mission.id) {
                  <div 
                    class="mission-pill" 
                    [class]="'priority-' + mission.priority.toLowerCase()"
                    [title]="mission.title"
                  >
                    {{ mission.title | slice:0:20 }}{{ mission.title.length > 20 ? '...' : '' }}
                  </div>
                }
                <div class="more-missions" *ngIf="day.missions.length > 3">
                  +{{ day.missions.length - 3 }} autres
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Week View -->
      <div class="week-container" *ngIf="viewMode === 'week'">
        <div class="week-header">
          @for (day of weekDays; track $index) {
            <div class="week-day-header">
              <span class="week-day-name">{{ day }}</span>
              <span class="week-day-date" [class.today]="isWeekDayToday($index)">
                {{ getWeekDayDate($index) | date:'d' }}
              </span>
            </div>
          }
        </div>

        <div class="week-grid">
          @for (day of weekDays; track $index) {
            <div class="week-column">
              @for (mission of getMissionsForWeekDay($index); track mission.id) {
                <a [routerLink]="['/missions', mission.id]" class="week-mission-card">
                  <div class="mission-time">
                    {{ mission.scheduledDate | date:'HH:mm' }}
                  </div>
                  <div class="mission-content">
                    <span class="mission-type" [class]="'type-' + mission.type.toLowerCase()">
                      {{ MISSION_TYPE_LABELS[mission.type] }}
                    </span>
                    <h4>{{ mission.title }}</h4>
                    <p>{{ mission.clientName }}</p>
                  </div>
                  <div class="mission-priority-bar" [class]="'priority-' + mission.priority.toLowerCase()"></div>
                </a>
              }
            </div>
          }
        </div>
      </div>

      <!-- Selected Day Panel -->
      <div class="day-panel" *ngIf="selectedDay()">
        <div class="panel-header">
          <h3>{{ selectedDay()!.date | date:'EEEE d MMMM yyyy':'':'fr-FR' }}</h3>
          <button class="close-btn" (click)="selectedDay.set(null)">✕</button>
        </div>

        <div class="panel-content">
          @if (selectedDay()!.missions.length === 0) {
            <div class="empty-state">
              <span class="empty-icon"><i class="fa-solid fa-inbox" style="font-size:inherit"></i></span>
              <p>Aucune mission ce jour</p>
              <a routerLink="/missions/new" class="btn btn-primary btn-sm" *ngIf="isSupervisor()">
                Planifier une mission
              </a>
            </div>
          } @else {
            <div class="panel-missions">
              @for (mission of selectedDay()!.missions; track mission.id) {
                <a [routerLink]="['/missions', mission.id]" class="panel-mission-card">
                  <div class="mission-time-block">
                    <span class="time">{{ mission.scheduledDate | date:'HH:mm' }}</span>
                    <span class="duration" *ngIf="mission.estimatedDuration">
                      {{ mission.estimatedDuration }} min
                    </span>
                  </div>
                  
                  <div class="mission-info">
                    <div class="mission-badges">
                      <span class="mission-type" [class]="'type-' + mission.type.toLowerCase()">
                        {{ MISSION_TYPE_LABELS[mission.type] }}
                      </span>
                      <span class="mission-status" [class]="'status-' + mission.status.toLowerCase()">
                        {{ MISSION_STATUS_LABELS[mission.status] }}
                      </span>
                    </div>
                    <h4>{{ mission.title }}</h4>
                    <p class="mission-address"><i class="fa-solid fa-location-dot"></i> {{ mission.address }}</p>
                    <p class="mission-client" *ngIf="mission.clientName">
                      <i class="fa-solid fa-building"></i> {{ mission.clientName }}
                    </p>
                    <p class="mission-assigned" *ngIf="mission.assignedToName || mission.assignedEmployeeName">
                      <i class="fa-solid fa-user"></i> {{ mission.assignedToName || mission.assignedEmployeeName }}
                    </p>
                  </div>

                  <div class="mission-priority-indicator" [class]="'priority-' + mission.priority.toLowerCase()">
                    {{ MISSION_PRIORITY_LABELS[mission.priority] }}
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot priority-low"></span>
          <span>Basse priorité</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot priority-medium"></span>
          <span>Priorité moyenne</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot priority-high"></span>
          <span>Haute priorité</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot priority-urgent"></span>
          <span>Urgent</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .header-content p {
      color: var(--text-light);
    }

    /* Calendar Navigation */
    .calendar-nav {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      background: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }

    .nav-btn {
      padding: 0.5rem 1rem;
      border: 2px solid var(--border-color);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all var(--transition-speed) ease;
    }

    .nav-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .today-btn {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .current-month {
      flex: 1;
      text-align: center;
      font-size: 1.25rem;
      color: var(--text-color);
      text-transform: capitalize;
    }

    /* View Toggle */
    .view-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .toggle-btn {
      padding: 0.625rem 1.25rem;
      border: 2px solid var(--border-color);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all var(--transition-speed) ease;
    }

    .toggle-btn:hover {
      border-color: var(--primary-color);
    }

    .toggle-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    /* Month View */
    .calendar-container {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--background-color);
      border-bottom: 1px solid var(--border-color);
    }

    .weekday {
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      color: var(--text-light);
      text-transform: uppercase;
      font-size: 0.75rem;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .calendar-day {
      min-height: 120px;
      padding: 0.5rem;
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background var(--transition-speed) ease;
    }

    .calendar-day:nth-child(7n) {
      border-right: none;
    }

    .calendar-day:hover {
      background: var(--background-color);
    }

    .calendar-day.other-month {
      background: rgba(0, 0, 0, 0.02);
    }

    .calendar-day.other-month .day-number {
      color: var(--text-light);
    }

    .calendar-day.today {
      background: rgba(30, 136, 229, 0.05);
    }

    .calendar-day.today .day-number {
      background: var(--primary-color);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .day-number {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .day-missions {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mission-pill {
      font-size: 0.625rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mission-pill.priority-low { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .mission-pill.priority-medium { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .mission-pill.priority-high { background: rgba(244, 67, 54, 0.1); color: var(--danger-color); }
    .mission-pill.priority-urgent { background: #b71c1c; color: white; }

    .more-missions {
      font-size: 0.625rem;
      color: var(--text-light);
      padding: 0.25rem;
    }

    /* Week View */
    .week-container {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--background-color);
      border-bottom: 1px solid var(--border-color);
    }

    .week-day-header {
      padding: 1rem;
      text-align: center;
    }

    .week-day-name {
      display: block;
      font-size: 0.75rem;
      color: var(--text-light);
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .week-day-date {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .week-day-date.today {
      background: var(--primary-color);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      min-height: 400px;
    }

    .week-column {
      border-right: 1px solid var(--border-color);
      padding: 0.5rem;
    }

    .week-column:last-child {
      border-right: none;
    }

    .week-mission-card {
      display: block;
      background: white;
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      position: relative;
      overflow: hidden;
      transition: transform var(--transition-speed) ease;
    }

    .week-mission-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .mission-time {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 0.25rem;
    }

    .mission-content .mission-type {
      font-size: 0.5rem;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .type-curage { background: rgba(30, 136, 229, 0.1); color: var(--primary-color); }
    .type-inspection { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .type-debouchage { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .type-pompage { background: rgba(0, 150, 136, 0.1); color: #00897b; }
    .type-maintenance { background: rgba(96, 125, 139, 0.1); color: #546e7a; }
    .type-urgence { background: rgba(244, 67, 54, 0.1); color: #e53935; }

    .mission-content h4 {
      font-size: 0.75rem;
      color: var(--text-color);
      margin: 0.25rem 0;
    }

    .mission-content p {
      font-size: 0.625rem;
      color: var(--text-light);
    }

    .mission-priority-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
    }

    .mission-priority-bar.priority-low { background: var(--success-color); }
    .mission-priority-bar.priority-medium { background: var(--warning-color); }
    .mission-priority-bar.priority-high { background: var(--danger-color); }
    .mission-priority-bar.priority-urgent { background: #b71c1c; }

    /* Day Panel */
    .day-panel {
      position: fixed;
      right: 0;
      top: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .panel-header h3 {
      font-size: 1.125rem;
      color: var(--text-color);
      text-transform: capitalize;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-light);
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .panel-missions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .panel-mission-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--background-color);
      border-radius: 12px;
      text-decoration: none;
      transition: background var(--transition-speed) ease;
    }

    .panel-mission-card:hover {
      background: rgba(30, 136, 229, 0.05);
    }

    .mission-time-block {
      text-align: center;
    }

    .mission-time-block .time {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .mission-time-block .duration {
      font-size: 0.625rem;
      color: var(--text-light);
    }

    .mission-info {
      flex: 1;
    }

    .mission-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .mission-status {
      font-size: 0.5rem;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .status-pending { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .status-assigned { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
    .status-in_progress { background: rgba(30, 136, 229, 0.1); color: var(--primary-color); }
    .status-completed { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }
    .status-awaiting_approval { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .status-approved { background: rgba(76, 175, 80, 0.1); color: var(--success-color); }

    .mission-info h4 {
      font-size: 0.875rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .mission-info p {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-bottom: 0.25rem;
    }

    .mission-priority-indicator {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      height: fit-content;
    }

    /* Legend */
    .legend {
      display: flex;
      gap: 2rem;
      justify-content: center;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-dot.priority-low { background: var(--success-color); }
    .legend-dot.priority-medium { background: var(--warning-color); }
    .legend-dot.priority-high { background: var(--danger-color); }
    .legend-dot.priority-urgent { background: #b71c1c; }

    @media (max-width: 1024px) {
      .calendar-day {
        min-height: 80px;
      }

      .day-missions {
        display: none;
      }

      .day-panel {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .calendar-nav {
        flex-wrap: wrap;
      }

      .weekday {
        font-size: 0.625rem;
        padding: 0.5rem;
      }

      .legend {
        flex-wrap: wrap;
        gap: 1rem;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  private missionService = inject(MissionService);
  private authService = inject(AuthService);

  isSupervisor = this.authService.isSupervisor;

  currentDate = signal(new Date());
  missions = signal<Mission[]>([]);
  selectedDay = signal<CalendarDay | null>(null);
  viewMode: 'month' | 'week' = 'month';

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  MISSION_PRIORITY_LABELS = MISSION_PRIORITY_LABELS;

  currentMonthLabel = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const missions = this.missions();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Days from previous month
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Make Sunday = 7
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push(this.createCalendarDay(d, false, today, missions));
    }

    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createCalendarDay(d, true, today, missions));
    }

    // Days from next month
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(d, false, today, missions));
    }

    return days;
  });

  private createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date, missions: Mission[]): CalendarDay {
    const dayMissions = missions.filter(m => {
      const dateStr = m.scheduledDate ?? m.createdAt;
      if (!dateStr) return false;
      const missionDate = new Date(dateStr);
      return missionDate.toDateString() === date.toDateString();
    });

    return {
      date,
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      missions: dayMissions
    };
  }

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    const date = this.currentDate();
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const employee = this.authService.currentEmployee ? this.authService.currentEmployee() : null;
    const isWorker = this.authService.isWorker ? this.authService.isWorker() : false;

    // Workers see only their assigned missions, supervisors/admins see all
    const obs = (isWorker && employee)
      ? this.missionService.getEmployeeMissionsForCalendar(employee.id, start, end)
      : this.missionService.getMissionsForCalendar(start, end);

    obs.subscribe({
      next: (missions) => this.missions.set(missions),
      error: (err: unknown) => console.error('Failed to load missions:', err)
    });
  }

  previousMonth(): void {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    this.loadMissions();
  }

  nextMonth(): void {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    this.loadMissions();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadMissions();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay.set(day);
  }

  getWeekStart(): Date {
    const date = new Date(this.currentDate());
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  getWeekDayDate(index: number): Date {
    const weekStart = this.getWeekStart();
    return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
  }

  isWeekDayToday(index: number): boolean {
    const date = this.getWeekDayDate(index);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getMissionsForWeekDay(index: number): Mission[] {
    const date = this.getWeekDayDate(index);
    return this.missions().filter(m => {
      const dateStr = m.scheduledDate ?? m.createdAt;
      if (!dateStr) return false;
      const missionDate = new Date(dateStr);
      return missionDate.toDateString() === date.toDateString();
    });
  }
}
