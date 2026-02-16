import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MissionService } from '../../../core/services/mission.service';
import { AuthService } from '../../../core/services/auth.service';
import { Mission, MissionStatus, MissionType, MissionPriority, MISSION_STATUS_LABELS, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../../core/models/mission.model';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="mission-list-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Missions</h1>
          <p>{{ filteredMissions().length }} mission(s) trouvée(s)</p>
        </div>
        <a routerLink="/missions/new" class="btn btn-primary" *ngIf="isSupervisor()">
          <i class="fa-solid fa-plus"></i> Nouvelle Mission
        </a>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher une mission..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
          />
          <span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
            <option value="">Tous les statuts</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ MISSION_STATUS_LABELS[status] }}</option>
            }
          </select>

          <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
            <option value="">Tous les types</option>
            @for (type of types; track type) {
              <option [value]="type">{{ MISSION_TYPE_LABELS[type] }}</option>
            }
          </select>

          <select [(ngModel)]="filterPriority" (ngModelChange)="applyFilters()">
            <option value="">Toutes priorités</option>
            @for (priority of priorities; track priority) {
              <option [value]="priority">{{ MISSION_PRIORITY_LABELS[priority] }}</option>
            }
          </select>

          <button class="btn btn-outline" (click)="resetFilters()">
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button 
          class="toggle-btn" 
          [class.active]="viewMode === 'cards'"
          (click)="viewMode = 'cards'"
        >
          <i class="fa-solid fa-grip"></i> Cartes
        </button>
        <button 
          class="toggle-btn" 
          [class.active]="viewMode === 'table'"
          (click)="viewMode = 'table'"
        >
          <i class="fa-solid fa-table-list"></i> Tableau
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner-large"></div>
        <p>Chargement des missions...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading() && filteredMissions().length === 0">
        <span class="empty-icon"><i class="fa-solid fa-clipboard-list" style="font-size:inherit"></i></span>
        <h3>Aucune mission trouvée</h3>
        <p>Modifiez vos filtres ou créez une nouvelle mission</p>
        <a routerLink="/missions/new" class="btn btn-primary" *ngIf="isSupervisor()">
          Créer une mission
        </a>
      </div>

      <!-- Cards View -->
      <div class="missions-grid" *ngIf="!isLoading() && viewMode === 'cards' && filteredMissions().length > 0">
        @for (mission of filteredMissions(); track mission.id) {
          <a [routerLink]="['/missions', mission.id]" class="mission-card">
            <div class="card-header">
              <span class="mission-type" [class]="'type-' + mission.type.toLowerCase()">
                {{ MISSION_TYPE_LABELS[mission.type] }}
              </span>
              <span class="mission-priority" [class]="'priority-' + mission.priority.toLowerCase()">
                {{ MISSION_PRIORITY_LABELS[mission.priority] }}
              </span>
            </div>
            
            <h3 class="mission-title">{{ mission.title }}</h3>
            
            <div class="mission-details">
              <div class="detail-row">
                <span class="detail-icon"><i class="fa-solid fa-location-dot"></i></span>
                <span>{{ mission.address || 'Adresse non spécifiée' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon"><i class="fa-solid fa-building"></i></span>
                <span>{{ mission.clientName || 'Client non spécifié' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon"><i class="fa-regular fa-calendar"></i></span>
                <span>{{ mission.scheduledDate | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="detail-row" *ngIf="mission.assignedToName || mission.assignedEmployeeName">
                <span class="detail-icon"><i class="fa-solid fa-user"></i></span>
                <span>{{ mission.assignedToName || mission.assignedEmployeeName }}</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="mission-status" [class]="'status-' + mission.status.toLowerCase()">
                {{ MISSION_STATUS_LABELS[mission.status] }}
              </span>
              <span class="mission-points" *ngIf="mission.basePoints">
                <i class="fa-solid fa-trophy"></i> {{ mission.basePoints }} pts
              </span>
            </div>
          </a>
        }
      </div>

      <!-- Table View -->
      <div class="missions-table-container" *ngIf="!isLoading() && viewMode === 'table' && filteredMissions().length > 0">
        <table class="missions-table">
          <thead>
            <tr>
              <th>Mission</th>
              <th>Type</th>
              <th>Client</th>
              <th>Date</th>
              <th>Assigné à</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (mission of filteredMissions(); track mission.id) {
              <tr>
                <td>
                  <div class="mission-cell">
                    <strong>{{ mission.title }}</strong>
                    <small>{{ mission.address }}</small>
                  </div>
                </td>
                <td>
                  <span class="badge" [class]="'type-' + mission.type.toLowerCase()">
                    {{ MISSION_TYPE_LABELS[mission.type] }}
                  </span>
                </td>
                <td>{{ mission.clientName || '-' }}</td>
                <td>{{ mission.scheduledDate | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ mission.assignedToName || mission.assignedEmployeeName || '-' }}</td>
                <td>
                  <span class="priority-badge" [class]="'priority-' + mission.priority.toLowerCase()">
                    {{ MISSION_PRIORITY_LABELS[mission.priority] }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="'status-' + mission.status.toLowerCase()">
                    {{ MISSION_STATUS_LABELS[mission.status] }}
                  </span>
                </td>
                <td>
                  <a [routerLink]="['/missions', mission.id]" class="btn btn-sm btn-outline">
                    Voir
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mission-list-page {
      max-width: 1400px;
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
      transition: border-color var(--transition-speed) ease;
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
      flex-wrap: wrap;
    }

    .filter-group select {
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 0.875rem;
      min-width: 160px;
      cursor: pointer;
    }

    .filter-group select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    /* View Toggle */
    .view-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .toggle-btn {
      padding: 0.75rem 1.25rem;
      border: 2px solid var(--border-color);
      background: white;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      transition: all var(--transition-speed) ease;
    }

    .toggle-btn:hover {
      border-color: var(--primary-color);
    }

    .toggle-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    /* Loading State */
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

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
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
      margin-bottom: 1.5rem;
    }

    /* Cards Grid */
    .missions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .mission-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      color: inherit;
      transition: all var(--transition-speed) ease;
      display: flex;
      flex-direction: column;
    }

    .mission-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
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

    .mission-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .mission-details {
      flex: 1;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
    }

    .detail-icon {
      font-size: 1rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

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
    .status-cancelled { background: rgba(158, 158, 158, 0.1); color: #757575; }

    .mission-points {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    /* Table View */
    .missions-table-container {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .missions-table {
      width: 100%;
      border-collapse: collapse;
    }

    .missions-table th {
      background: var(--background-color);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .missions-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .missions-table tbody tr:hover {
      background: var(--background-color);
    }

    .mission-cell {
      display: flex;
      flex-direction: column;
    }

    .mission-cell strong {
      color: var(--text-color);
    }

    .mission-cell small {
      color: var(--text-light);
      font-size: 0.75rem;
    }

    .badge {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .priority-badge {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .status-badge {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    @media (max-width: 1024px) {
      .filter-group {
        flex-direction: column;
      }

      .filter-group select {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .missions-grid {
        grid-template-columns: 1fr;
      }

      .missions-table-container {
        overflow-x: auto;
      }

      .missions-table {
        min-width: 800px;
      }
    }
  `]
})
export class MissionListComponent implements OnInit {
  private missionService = inject(MissionService);
  private authService = inject(AuthService);

  isSupervisor = this.authService.isSupervisor;

  missions = signal<Mission[]>([]);
  filteredMissions = signal<Mission[]>([]);
  isLoading = signal(true);

  searchQuery = '';
  filterStatus = '';
  filterType = '';
  filterPriority = '';
  viewMode: 'cards' | 'table' = 'cards';

  statuses = Object.keys(MISSION_STATUS_LABELS) as MissionStatus[];
  types = Object.keys(MISSION_TYPE_LABELS) as MissionType[];
  priorities = Object.keys(MISSION_PRIORITY_LABELS) as MissionPriority[];

  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_PRIORITY_LABELS = MISSION_PRIORITY_LABELS;

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.isLoading.set(true);
    this.missionService.getAllMissions().subscribe({
      next: (missions) => {
        this.missions.set(missions);
        this.filteredMissions.set(missions);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load missions:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let result = this.missions();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.address?.toLowerCase().includes(query) ||
        m.clientName?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus) {
      result = result.filter(m => m.status === this.filterStatus);
    }

    if (this.filterType) {
      result = result.filter(m => m.type === this.filterType);
    }

    if (this.filterPriority) {
      result = result.filter(m => m.priority === this.filterPriority);
    }

    this.filteredMissions.set(result);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterType = '';
    this.filterPriority = '';
    this.filteredMissions.set(this.missions());
  }
}
