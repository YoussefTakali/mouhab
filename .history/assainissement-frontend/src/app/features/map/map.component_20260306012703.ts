import {
  Component, OnInit, OnDestroy, AfterViewInit,
  inject, signal, ElementRef, ViewChild,
  ChangeDetectionStrategy, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { Map, NavigationControl, Marker, Popup, LngLatBounds } from 'maplibre-gl';
import { MapService, MapData } from '../../core/services/map.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { Mission, MISSION_STATUS_LABELS, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../core/models/mission.model';
import { Employee } from '../../core/models/user.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-page" [class.panel-open]="panelOpen()">
      <!-- MapLibre container -->
      <div #mapContainer class="map-container"></div>

      <!-- Toggle Panel Button -->
      <button class="toggle-panel-btn" (click)="togglePanel()" [title]="panelOpen() ? 'Masquer le panneau' : 'Afficher les interventions'">
        <i class="fa-solid" [class.fa-chevron-right]="panelOpen()" [class.fa-chevron-left]="!panelOpen()"></i>
      </button>

      <!-- Map Controls -->
      <div class="map-controls">
        <button class="map-control-btn" (click)="centerOnMyLocation()" title="Ma position">
          <i class="fa-solid fa-location-crosshairs"></i>
        </button>
        <button class="map-control-btn" (click)="fitAllMarkers()" title="Voir tout">
          <i class="fa-solid fa-expand"></i>
        </button>
        <button class="map-control-btn" (click)="refreshData()" title="Actualiser">
          <i class="fa-solid fa-arrows-rotate" [class.spinning]="isLoading()"></i>
        </button>
      </div>

      <!-- Legend -->
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-marker mission-marker"></span>
          <span>Interventions</span>
        </div>
        <div class="legend-item">
          <span class="legend-marker worker-marker"></span>
          <span>Techniciens</span>
        </div>
        <div class="legend-item">
          <span class="legend-marker my-marker"></span>
          <span>Ma position</span>
        </div>
      </div>

      <!-- Side Panel -->
      <aside class="interventions-panel" [class.open]="panelOpen()">
        <div class="panel-header">
          <h2><i class="fa-solid fa-clipboard-list"></i> Interventions</h2>
          <span class="count-badge">{{ filteredMissions().length }}</span>
        </div>

        <!-- Filters -->
        <div class="panel-filters">
          <div class="search-input">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Rechercher..." [ngModel]="searchQuery" (ngModelChange)="onSearchChange($event)" />
          </div>
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="CREATED">Créée</option>
            <option value="ASSIGNED">Assignée</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="ON_THE_WAY">En route</option>
            <option value="ON_SITE">Sur site</option>
            <option value="COMPLETED">Terminée</option>
            <option value="PENDING_REVIEW">En validation</option>
          </select>
        </div>

        <!-- Tab: Workers/Missions -->
        <div class="panel-tabs">
          <button class="tab-btn" [class.active]="activeTab() === 'missions'" (click)="activeTab.set('missions')">
            <i class="fa-solid fa-clipboard-list"></i> Missions
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'workers'" (click)="activeTab.set('workers')">
            <i class="fa-solid fa-users"></i> Techniciens
          </button>
        </div>

        <!-- Missions List -->
        <div class="panel-content" *ngIf="activeTab() === 'missions'">
          @if (isLoading()) {
            <div class="panel-loading">
              <div class="spinner"></div>
              <p>Chargement...</p>
            </div>
          } @else if (filteredMissions().length === 0) {
            <div class="panel-empty">
              <i class="fa-solid fa-map-location-dot"></i>
              <p>Aucune intervention trouvée</p>
            </div>
          } @else {
            @for (mission of filteredMissions(); track mission.id) {
              <div
                class="intervention-card"
                [class.selected]="selectedMissionId() === mission.id"
                (click)="focusMission(mission)"
              >
                <div class="card-top">
                  <span class="mission-type-badge" [class]="'type-' + mission.type.toLowerCase()">
                    {{ MISSION_TYPE_LABELS[mission.type] || mission.type }}
                  </span>
                  <span class="mission-priority-badge" [class]="'priority-' + mission.priority?.toLowerCase()">
                    {{ MISSION_PRIORITY_LABELS[mission.priority] || mission.priority }}
                  </span>
                </div>
                <h4 class="mission-title">{{ mission.title }}</h4>
                <div class="card-details">
                  <div class="detail-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>{{ mission.address }}</span>
                  </div>
                  <div class="detail-row" *ngIf="mission.clientName">
                    <i class="fa-solid fa-building"></i>
                    <span>{{ mission.clientName }}</span>
                  </div>
                  <div class="detail-row" *ngIf="mission.assignedToName || mission.assignedEmployeeName">
                    <i class="fa-solid fa-user-hard-hat"></i>
                    <span>{{ mission.assignedToName || mission.assignedEmployeeName }}</span>
                  </div>
                  <div class="detail-row" *ngIf="mission.scheduledStartTime || mission.scheduledDate">
                    <i class="fa-regular fa-calendar"></i>
                    <span>{{ (mission.scheduledStartTime || mission.scheduledDate) | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
                <div class="card-bottom">
                  <span class="status-badge" [class]="'status-' + mission.status.toLowerCase()">
                    {{ MISSION_STATUS_LABELS[mission.status] || mission.status }}
                  </span>
                  <a [routerLink]="['/missions', mission.id]" class="view-btn" (click)="$event.stopPropagation()">
                    Détails <i class="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            }
          }
        </div>

        <!-- Workers List -->
        <div class="panel-content" *ngIf="activeTab() === 'workers'">
          @if (isLoading()) {
            <div class="panel-loading">
              <div class="spinner"></div>
              <p>Chargement...</p>
            </div>
          } @else if (workers().length === 0) {
            <div class="panel-empty">
              <i class="fa-solid fa-users"></i>
              <p>Aucun technicien localisé</p>
            </div>
          } @else {
            @for (worker of workers(); track worker.id) {
              <div
                class="worker-card"
                [class.selected]="selectedWorkerId() === worker.id"
                (click)="focusWorker(worker)"
              >
                <div class="worker-avatar">
                  {{ worker.user?.firstName?.charAt(0) || '' }}{{ worker.user?.lastName?.charAt(0) || '' }}
                </div>
                <div class="worker-info">
                  <h4>{{ worker.user?.firstName }} {{ worker.user?.lastName }}</h4>
                  <p class="worker-address" *ngIf="worker.currentAddress">
                    <i class="fa-solid fa-location-dot"></i> {{ worker.currentAddress }}
                  </p>
                  <p class="worker-coords" *ngIf="!worker.currentAddress && worker.currentLatitude">
                    <i class="fa-solid fa-location-dot"></i> {{ worker.currentLatitude?.toFixed(4) }}, {{ worker.currentLongitude?.toFixed(4) }}
                  </p>
                  <div class="worker-stats">
                    <span class="stat"><i class="fa-solid fa-trophy"></i> {{ worker.totalPoints }} pts</span>
                    <span class="stat"><i class="fa-solid fa-clipboard-check"></i> {{ worker.totalMissionsCompleted || 0 }}</span>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </aside>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      width: calc(100% + 4rem);
      height: calc(100vh - 64px);
      overflow: hidden;
      margin: -2rem;
    }

    .map-page {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .map-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
    }

    /* Toggle Panel Button */
    .toggle-panel-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1001;
      background: white;
      border: none;
      width: 32px;
      height: 64px;
      border-radius: 8px 0 0 8px;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color);
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .map-page.panel-open .toggle-panel-btn {
      right: 400px;
    }

    .toggle-panel-btn:hover {
      background: var(--primary-color);
      color: white;
    }

    /* Map Controls */
    .map-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .map-page.panel-open .map-controls {
      right: 416px;
    }

    .map-control-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: none;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      color: var(--text-color);
      transition: all 0.2s ease;
    }

    .map-control-btn:hover {
      background: var(--primary-color);
      color: white;
      transform: scale(1.05);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Map Legend */
    .map-legend {
      position: absolute;
      bottom: 24px;
      left: 16px;
      z-index: 1000;
      background: white;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--text-color);
    }

    .legend-marker {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .legend-marker.mission-marker {
      background: #e53935;
    }

    .legend-marker.worker-marker {
      background: #1565c0;
    }

    .legend-marker.my-marker {
      background: #4caf50;
    }

    /* Side Panel */
    .interventions-panel {
      position: absolute;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100%;
      background: white;
      z-index: 1000;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      will-change: right;
    }

    .interventions-panel.open {
      right: 0;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%);
      color: white;
    }

    .panel-header h2 {
      font-size: 1.125rem;
      margin: 0;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .count-badge {
      background: rgba(255, 255, 255, 0.25);
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    /* Panel Filters */
    .panel-filters {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: #fafafa;
    }

    .search-input {
      position: relative;
    }

    .search-input i {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
      font-size: 0.85rem;
    }

    .search-input input {
      width: 100%;
      padding: 0.6rem 0.75rem 0.6rem 2.25rem;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.85rem;
      transition: border-color 0.2s;
    }

    .search-input input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .filter-select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.825rem;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    /* Panel Tabs */
    .panel-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
    }

    .tab-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      color: var(--text-light);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-bottom: 2px solid transparent;
    }

    .tab-btn:hover {
      color: var(--primary-color);
      background: rgba(21, 101, 192, 0.04);
    }

    .tab-btn.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      font-weight: 600;
    }

    /* Panel Content */
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .panel-loading, .panel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: var(--text-light);
      text-align: center;
    }

    .panel-empty i {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      opacity: 0.4;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    /* Intervention Card */
    .intervention-card {
      background: #fafafa;
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      padding: 0.875rem;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }

    .intervention-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(21, 101, 192, 0.1);
      background: white;
    }

    .intervention-card.selected {
      border-color: var(--primary-color);
      background: rgba(21, 101, 192, 0.04);
      box-shadow: 0 2px 12px rgba(21, 101, 192, 0.15);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .mission-type-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .type-curage { background: rgba(30, 136, 229, 0.1); color: #1565c0; }
    .type-vidange_fosse, .type-vidange_bac { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .type-inspection_camera, .type-inspection_regard, .type-inspection_reseau { background: rgba(0, 150, 136, 0.1); color: #00897b; }
    .type-urgence_bouchage, .type-urgence_debordement { background: rgba(244, 67, 54, 0.1); color: #e53935; }
    .type-maintenance_preventive { background: rgba(96, 125, 139, 0.1); color: #546e7a; }
    .type-debouchage { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .type-pompage { background: rgba(76, 175, 80, 0.1); color: #388e3c; }
    .type-hydrocurage { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
    .type-diagnostic { background: rgba(121, 85, 72, 0.1); color: #5d4037; }
    .type-other { background: rgba(158, 158, 158, 0.1); color: #616161; }

    .mission-priority-badge {
      font-size: 0.6rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .priority-low { background: rgba(76, 175, 80, 0.1); color: #388e3c; }
    .priority-normal { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
    .priority-high { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .priority-urgent { background: rgba(244, 67, 54, 0.15); color: #e53935; }
    .priority-emergency { background: #e53935; color: white; }

    .mission-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .card-details {
      margin-bottom: 0.5rem;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: var(--text-light);
      margin-bottom: 0.3rem;
    }

    .detail-row i {
      margin-top: 2px;
      font-size: 0.7rem;
      width: 14px;
      text-align: center;
      flex-shrink: 0;
    }

    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-color);
    }

    .status-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
    }

    .status-created { background: rgba(158, 158, 158, 0.15); color: #616161; }
    .status-assigned { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
    .status-accepted { background: rgba(33, 150, 243, 0.15); color: #1565c0; }
    .status-on_the_way { background: rgba(255, 152, 0, 0.1); color: #f57c00; }
    .status-on_site { background: rgba(0, 150, 136, 0.1); color: #00897b; }
    .status-in_progress { background: rgba(30, 136, 229, 0.12); color: #1565c0; }
    .status-completed { background: rgba(76, 175, 80, 0.1); color: #388e3c; }
    .status-pending_review { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
    .status-approved { background: rgba(76, 175, 80, 0.15); color: #2e7d32; }
    .status-rejected { background: rgba(244, 67, 54, 0.1); color: #e53935; }
    .status-cancelled { background: rgba(158, 158, 158, 0.1); color: #757575; }
    .status-on_hold { background: rgba(255, 152, 0, 0.15); color: #ef6c00; }

    .view-btn {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: gap 0.2s;
    }

    .view-btn:hover {
      gap: 0.5rem;
    }

    /* Worker Card */
    .worker-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem;
      background: #fafafa;
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;
    }

    .worker-card:hover {
      border-color: var(--primary-color);
      background: white;
    }

    .worker-card.selected {
      border-color: var(--primary-color);
      background: rgba(21, 101, 192, 0.04);
    }

    .worker-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .worker-info {
      flex: 1;
      min-width: 0;
    }

    .worker-info h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.15rem;
    }

    .worker-address, .worker-coords {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-bottom: 0.3rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .worker-address i, .worker-coords i {
      font-size: 0.65rem;
    }

    .worker-stats {
      display: flex;
      gap: 0.75rem;
    }

    .worker-stats .stat {
      font-size: 0.7rem;
      color: var(--text-light);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .worker-stats .stat i {
      font-size: 0.65rem;
      color: var(--primary-color);
    }

    /* Scrollbar */
    .panel-content::-webkit-scrollbar {
      width: 5px;
    }

    .panel-content::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 10px;
    }

    .panel-content::-webkit-scrollbar-track {
      background: transparent;
    }

    /* Responsive */
    @media (max-width: 768px) {
      :host {
        width: calc(100% + 2rem);
        margin: -1rem;
      }

      .interventions-panel {
        width: 100%;
        right: -100%;
      }

      .map-page.panel-open .toggle-panel-btn {
        right: 100%;
        display: none;
      }

      .map-page.panel-open .map-controls {
        display: none;
      }

      .map-legend {
        bottom: 12px;
        left: 8px;
        padding: 8px 12px;
      }

      .legend-item {
        font-size: 0.7rem;
      }
    }
  `]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainerRef!: ElementRef<HTMLDivElement>;

  private readonly mapService = inject(MapService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private map!: Map;
  private watchId: number | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // GPS throttle
  private lastGpsSendTime = 0;
  private readonly GPS_SEND_INTERVAL_MS = 15_000;

  // Search debounce
  private readonly searchSubject = new Subject<string>();

  // Markers management
  private missionMarkers: { mission: Mission; marker: Marker; popup: Popup }[] = [];
  private workerMarkers: { worker: Employee; marker: Marker; popup: Popup }[] = [];
  private myLocationMarker: Marker | null = null;

  // State signals
  missions = signal<Mission[]>([]);
  workers = signal<Employee[]>([]);
  filteredMissions = signal<Mission[]>([]);
  isLoading = signal(true);
  panelOpen = signal(true);
  activeTab = signal<'missions' | 'workers'>('missions');
  selectedMissionId = signal<number | null>(null);
  selectedWorkerId = signal<number | null>(null);

  // Filters
  searchQuery = '';
  filterStatus = '';

  // Labels
  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_PRIORITY_LABELS = MISSION_PRIORITY_LABELS;

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(250)).subscribe(query => {
      this.searchQuery = query;
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadData();
    this.startGPSTracking();
    this.refreshInterval = setInterval(() => this.refreshWorkerLocations(), 30_000);

    // Observe container resize to keep map in sync
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.resize();
    });
    this.resizeObserver.observe(this.mapContainerRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
    }
    this.resizeObserver?.disconnect();
    this.searchSubject.complete();

    // Clean up markers
    this.missionMarkers.forEach(m => m.marker.remove());
    this.workerMarkers.forEach(w => w.marker.remove());
    this.myLocationMarker?.remove();
    this.map?.remove();
  }

  private initMap(): void {
    this.ngZone.runOutsideAngular(() => {
      this.map = new Map({
        container: this.mapContainerRef.nativeElement,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [-7.5898, 33.5731], // Casablanca [lng, lat]
        zoom: 11,
        attributionControl: {},
      });

      this.map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

      // Force resize once fully loaded to avoid partial tiles
      this.map.on('load', () => {
        this.map.resize();
      });
    });
  }

  // ─── Data Loading ──────────────────────────────────────────────────
  private loadData(): void {
    this.isLoading.set(true);
    this.cdr.markForCheck();

    this.mapService.getMapData().subscribe({
      next: (data: MapData) => {
        this.missions.set(data.missions);
        this.workers.set(data.workers);
        this.applyFilters();
        this.buildMissionMarkers(data.missions);
        this.buildWorkerMarkers(data.workers);
        this.isLoading.set(false);
        this.cdr.markForCheck();

        setTimeout(() => this.fitAllMarkers(), 400);
      },
      error: (err) => {
        console.error('Failed to load map data:', err);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  refreshData(): void {
    this.loadData();
  }

  private refreshWorkerLocations(): void {
    this.mapService.getWorkersWithLocation().subscribe({
      next: (workers) => {
        this.workers.set(workers);
        this.buildWorkerMarkers(workers);
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Mission Markers ──────────────────────────────────────────────
  private buildMissionMarkers(missions: Mission[]): void {
    // Remove old markers
    this.missionMarkers.forEach(m => m.marker.remove());
    this.missionMarkers = [];

    for (const mission of missions) {
      if (!mission.latitude || !mission.longitude) continue;

      const isUrgent = mission.priority === 'URGENT' || mission.priority === 'EMERGENCY';
      const color = isUrgent ? '#b71c1c' : '#e53935';
      const size = isUrgent ? 38 : 32;

      // Create custom HTML marker element
      const el = document.createElement('div');
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${size}" height="${size}">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z"
                fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
        </svg>
      `;

      const statusLabel = MISSION_STATUS_LABELS[mission.status] || mission.status;
      const typeLabel = MISSION_TYPE_LABELS[mission.type] || mission.type;
      const priorityLabel = MISSION_PRIORITY_LABELS[mission.priority] || mission.priority;
      const assignee = mission.assignedToName || mission.assignedEmployeeName || 'Non assignée';
      const googleMapsUrl = this.getGoogleMapsUrl(mission.latitude, mission.longitude);

      const popup = new Popup({ offset: 25, closeButton: true, maxWidth: '280px' }).setHTML(`
        <div style="font-family:'Urbanist',sans-serif;padding:4px;">
          <div style="font-size:0.7rem;font-weight:600;color:#1565c0;text-transform:uppercase;margin-bottom:4px;">${typeLabel}</div>
          <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;color:#1a1a2e;">${mission.title}</div>
          <div style="font-size:0.8rem;color:#666;margin-bottom:3px;">
            <i class="fa-solid fa-location-dot" style="width:14px;"></i> ${mission.address}
          </div>
          ${mission.clientName ? `<div style="font-size:0.8rem;color:#666;margin-bottom:3px;"><i class="fa-solid fa-building" style="width:14px;"></i> ${mission.clientName}</div>` : ''}
          <div style="font-size:0.8rem;color:#666;margin-bottom:3px;">
            <i class="fa-solid fa-user" style="width:14px;"></i> ${assignee}
          </div>
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:4px;background:rgba(33,150,243,0.1);color:#1976d2;">${statusLabel}</span>
            <span style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:4px;background:rgba(255,152,0,0.1);color:#f57c00;">${priorityLabel}</span>
          </div>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
             style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;padding:8px 12px;background:linear-gradient(135deg,#4285f4 0%,#34a853 100%);color:white;text-decoration:none;border-radius:6px;font-size:0.8rem;font-weight:600;">
            <i class="fa-solid fa-map-location-dot"></i> Ouvrir dans Google Maps
          </a>
        </div>
      `);

      const marker = new Marker({ element: el })
        .setLngLat([mission.longitude, mission.latitude])
        .setPopup(popup)
        .addTo(this.map);

      el.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.selectedMissionId.set(mission.id);
          this.activeTab.set('missions');
          if (!this.panelOpen()) this.panelOpen.set(true);
          this.cdr.markForCheck();
        });
      });

      this.missionMarkers.push({ mission, marker, popup });
    }
  }

  // ─── Worker Markers ───────────────────────────────────────────────
  private buildWorkerMarkers(workers: Employee[]): void {
    // Remove old markers
    this.workerMarkers.forEach(w => w.marker.remove());
    this.workerMarkers = [];

    for (const worker of workers) {
      if (!worker.currentLatitude || !worker.currentLongitude) continue;

      const name = worker.user ? `${worker.user.firstName} ${worker.user.lastName}` : 'Technicien';
      const initials = worker.user
        ? `${worker.user.firstName?.charAt(0) || ''}${worker.user.lastName?.charAt(0) || ''}`
        : 'T';

      // Create custom HTML marker element – blue circle with initials
      const el = document.createElement('div');
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.background = 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = '700';
      el.style.fontSize = '0.7rem';
      el.style.cursor = 'pointer';
      el.style.fontFamily = "'Urbanist', sans-serif";
      el.textContent = initials;

      const googleMapsUrl = this.getGoogleMapsUrl(worker.currentLatitude, worker.currentLongitude);

      const popup = new Popup({ offset: 20, closeButton: true, maxWidth: '250px' }).setHTML(`
        <div style="font-family:'Urbanist',sans-serif;padding:4px;">
          <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;color:#1a1a2e;">
            <i class="fa-solid fa-hard-hat" style="color:#1565c0;"></i> ${name}
          </div>
          ${worker.currentAddress ? `<div style="font-size:0.8rem;color:#666;margin-bottom:3px;"><i class="fa-solid fa-location-dot" style="width:14px;"></i> ${worker.currentAddress}</div>` : ''}
          <div style="font-size:0.8rem;color:#666;margin-bottom:3px;">
            <i class="fa-solid fa-trophy" style="width:14px;color:#ff9800;"></i> ${worker.totalPoints || 0} pts
          </div>
          <div style="font-size:0.8rem;color:#666;">
            <i class="fa-solid fa-clipboard-check" style="width:14px;color:#4caf50;"></i> ${worker.totalMissionsCompleted || 0} missions
          </div>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
             style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;padding:8px 12px;background:linear-gradient(135deg,#4285f4 0%,#34a853 100%);color:white;text-decoration:none;border-radius:6px;font-size:0.8rem;font-weight:600;">
            <i class="fa-solid fa-map-location-dot"></i> Ouvrir dans Google Maps
          </a>
        </div>
      `);

      const marker = new Marker({ element: el })
        .setLngLat([worker.currentLongitude, worker.currentLatitude])
        .setPopup(popup)
        .addTo(this.map);

      el.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.selectedWorkerId.set(worker.id);
          this.activeTab.set('workers');
          if (!this.panelOpen()) this.panelOpen.set(true);
          this.cdr.markForCheck();
        });
      });

      this.workerMarkers.push({ worker, marker, popup });
    }
  }

  // ─── My Location Marker ──────────────────────────────────────────
  private updateMyLocationMarker(lat: number, lng: number): void {
    if (this.myLocationMarker) {
      this.myLocationMarker.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.style.width = '22px';
      el.style.height = '22px';
      el.style.borderRadius = '50%';
      el.style.background = '#4caf50';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.3), 0 2px 6px rgba(0,0,0,0.3)';

      this.myLocationMarker = new Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(this.map);
    }
  }

  // ─── GPS Tracking ─────────────────────────────────────────────────
  private startGPSTracking(): void {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.updateMyLocationMarker(latitude, longitude);

        const now = Date.now();
        if (now - this.lastGpsSendTime >= this.GPS_SEND_INTERVAL_MS) {
          this.lastGpsSendTime = now;
          const employee = this.authService.currentEmployee();
          if (employee?.id) {
            this.employeeService.updateLocation(employee.id, latitude, longitude).subscribe({
              error: (err) => console.error('Failed to update location:', err)
            });
          }
        }
      },
      (error) => console.warn('GPS error:', error.message),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  }

  // ─── Public Methods (Template) ────────────────────────────────────
  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  togglePanel(): void {
    this.panelOpen.update(v => !v);
    // Resize the map after panel animation completes
    setTimeout(() => this.map?.resize(), 350);
  }

  centerOnMyLocation(): void {
    if (this.myLocationMarker) {
      const lngLat = this.myLocationMarker.getLngLat();
      this.map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 16, duration: 800 });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const { latitude, longitude } = p.coords;
          this.updateMyLocationMarker(latitude, longitude);
          this.map.flyTo({ center: [longitude, latitude], zoom: 16, duration: 800 });
        },
        () => console.warn('Could not get location'),
        { timeout: 8000 }
      );
    }
  }

  fitAllMarkers(): void {
    if (!this.map) return;

    const bounds = new LngLatBounds();
    let hasPoints = false;

    for (const m of this.missionMarkers) {
      bounds.extend(m.marker.getLngLat());
      hasPoints = true;
    }
    for (const w of this.workerMarkers) {
      bounds.extend(w.marker.getLngLat());
      hasPoints = true;
    }
    if (this.myLocationMarker) {
      bounds.extend(this.myLocationMarker.getLngLat());
      hasPoints = true;
    }

    if (hasPoints) {
      this.map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
    }
  }

  focusMission(mission: Mission): void {
    this.selectedMissionId.set(mission.id);
    if (mission.latitude && mission.longitude) {
      this.map.flyTo({ center: [mission.longitude, mission.latitude], zoom: 16, duration: 800 });
      // Open the popup for this mission
      const entry = this.missionMarkers.find(m => m.mission.id === mission.id);
      if (entry) {
        // Close any other open popups first
        this.missionMarkers.forEach(m => m.popup.isOpen() && m.marker.togglePopup());
        this.workerMarkers.forEach(w => w.popup.isOpen() && w.marker.togglePopup());
        if (!entry.popup.isOpen()) entry.marker.togglePopup();
      }
    }
  }

  focusWorker(worker: Employee): void {
    this.selectedWorkerId.set(worker.id);
    if (worker.currentLatitude && worker.currentLongitude) {
      this.map.flyTo({ center: [worker.currentLongitude, worker.currentLatitude], zoom: 16, duration: 800 });
      const entry = this.workerMarkers.find(w => w.worker.id === worker.id);
      if (entry) {
        this.missionMarkers.forEach(m => m.popup.isOpen() && m.marker.togglePopup());
        this.workerMarkers.forEach(w => w.popup.isOpen() && w.marker.togglePopup());
        if (!entry.popup.isOpen()) entry.marker.togglePopup();
      }
    }
  }

  // ─── Google Maps URL Helper ─────────────────────────────────────
  private getGoogleMapsUrl(lat: number, lng: number): string {
    // This URL format works on both desktop (opens Google Maps website) 
    // and mobile (opens Google Maps app if installed)
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  applyFilters(): void {
    let result = this.missions();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q) ||
        m.clientName?.toLowerCase().includes(q) ||
        (m.assignedToName || m.assignedEmployeeName || '').toLowerCase().includes(q)
      );
    }

    if (this.filterStatus) {
      result = result.filter(m => m.status === this.filterStatus);
    }

    this.filteredMissions.set(result);
  }
}
