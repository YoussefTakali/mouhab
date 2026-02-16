import { Component, OnInit, OnDestroy, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MapService, MapData } from '../../core/services/map.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { Mission, MISSION_STATUS_LABELS, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../core/models/mission.model';
import { Employee } from '../../core/models/user.model';

// Fix default marker icons for Leaflet with Webpack/Angular
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="map-page" [class.panel-open]="panelOpen()">
      <!-- Map Container -->
      <div id="map" class="map-container"></div>

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
            <input type="text" placeholder="Rechercher..." [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" />
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
      width: 100%;
      height: calc(100vh - 64px);
      overflow: hidden;
    }

    .map-page {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
    }

    .map-container {
      flex: 1;
      height: 100%;
      z-index: 1;
      transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      transition: all 0.3s ease;
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
      transition: all 0.2s ease;
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
      transition: all 0.2s ease;
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
  private readonly mapService = inject(MapService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);

  private map!: L.Map;
  private missionMarkers: L.Marker[] = [];
  private workerMarkers: L.Marker[] = [];
  private myLocationMarker: L.Marker | null = null;
  private watchId: number | null = null;
  private refreshInterval: any;

  // State
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

  // Custom icons
  private missionIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background: #e53935; 
      width: 32px; height: 32px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 3px solid white; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><i class="fa-solid fa-wrench" style="
      transform: rotate(45deg); 
      color: white; 
      font-size: 12px;
    "></i></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  private urgentMissionIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background: #b71c1c; 
      width: 36px; height: 36px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 3px solid #ffcdd2; 
      box-shadow: 0 2px 8px rgba(183,28,28,0.5);
      display: flex; align-items: center; justify-content: center;
      animation: pulse-marker 2s infinite;
    "><i class="fa-solid fa-triangle-exclamation" style="
      transform: rotate(45deg); 
      color: white; 
      font-size: 14px;
    "></i></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });

  private workerIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background: #1565c0; 
      width: 34px; height: 34px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><i class="fa-solid fa-user-hard-hat" style="
      color: white; 
      font-size: 14px;
    "></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
  });

  private myLocationIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      width: 20px; height: 20px; 
      background: #4caf50; 
      border-radius: 50%; 
      border: 4px solid white; 
      box-shadow: 0 0 0 3px rgba(76,175,80,0.3), 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14]
  });

  ngOnInit(): void {
    this.loadData();
    // Refresh worker locations every 30 seconds
    this.refreshInterval = setInterval(() => this.refreshWorkerLocations(), 30000);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.startGPSTracking();
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default center: Morocco / Casablanca area
    this.map = L.map('map', {
      center: [33.5731, -7.5898],
      zoom: 12,
      zoomControl: false
    });

    // Add zoom control to bottom-left
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Tile layer - OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    // Fix map rendering issue when container size changes
    setTimeout(() => this.map.invalidateSize(), 100);
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.mapService.getMapData().subscribe({
      next: (data: MapData) => {
        this.missions.set(data.missions);
        this.workers.set(data.workers);
        this.applyFilters();
        this.addMissionMarkers(data.missions);
        this.addWorkerMarkers(data.workers);
        this.isLoading.set(false);

        // Fit bounds to show all markers
        setTimeout(() => this.fitAllMarkers(), 300);
      },
      error: (err) => {
        console.error('Failed to load map data:', err);
        this.isLoading.set(false);
      }
    });
  }

  refreshData(): void {
    // Clear existing markers
    this.missionMarkers.forEach(m => m.remove());
    this.workerMarkers.forEach(m => m.remove());
    this.missionMarkers = [];
    this.workerMarkers = [];

    this.loadData();
  }

  private refreshWorkerLocations(): void {
    this.mapService.getWorkersWithLocation().subscribe({
      next: (workers) => {
        this.workers.set(workers);
        // Update worker markers
        this.workerMarkers.forEach(m => m.remove());
        this.workerMarkers = [];
        this.addWorkerMarkers(workers);
      }
    });
  }

  private addMissionMarkers(missions: Mission[]): void {
    missions.forEach(mission => {
      if (mission.latitude && mission.longitude) {
        const isUrgent = mission.priority === 'URGENT' || mission.priority === 'EMERGENCY';
        const icon = isUrgent ? this.urgentMissionIcon : this.missionIcon;

        const marker = L.marker([mission.latitude, mission.longitude], { icon })
          .addTo(this.map)
          .bindPopup(this.createMissionPopup(mission));

        marker.on('click', () => {
          this.selectedMissionId.set(mission.id);
          this.activeTab.set('missions');
          if (!this.panelOpen()) this.panelOpen.set(true);
        });

        this.missionMarkers.push(marker);
      }
    });
  }

  private addWorkerMarkers(workers: Employee[]): void {
    workers.forEach(worker => {
      if (worker.currentLatitude && worker.currentLongitude) {
        const marker = L.marker([worker.currentLatitude, worker.currentLongitude], { icon: this.workerIcon })
          .addTo(this.map)
          .bindPopup(this.createWorkerPopup(worker));

        marker.on('click', () => {
          this.selectedWorkerId.set(worker.id);
          this.activeTab.set('workers');
          if (!this.panelOpen()) this.panelOpen.set(true);
        });

        this.workerMarkers.push(marker);
      }
    });
  }

  private createMissionPopup(mission: Mission): string {
    const statusLabel = MISSION_STATUS_LABELS[mission.status] || mission.status;
    const typeLabel = MISSION_TYPE_LABELS[mission.type] || mission.type;
    const priorityLabel = MISSION_PRIORITY_LABELS[mission.priority] || mission.priority;
    const assignee = mission.assignedToName || mission.assignedEmployeeName || 'Non assignée';

    return `
      <div style="min-width: 220px; font-family: 'Urbanist', sans-serif;">
        <div style="font-size: 0.7rem; font-weight: 600; color: #1565c0; text-transform: uppercase; margin-bottom: 4px;">${typeLabel}</div>
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: #1a1a2e;">${mission.title}</div>
        <div style="font-size: 0.8rem; color: #666; margin-bottom: 3px;">
          <i class="fa-solid fa-location-dot" style="width: 14px;"></i> ${mission.address}
        </div>
        ${mission.clientName ? `<div style="font-size: 0.8rem; color: #666; margin-bottom: 3px;"><i class="fa-solid fa-building" style="width: 14px;"></i> ${mission.clientName}</div>` : ''}
        <div style="font-size: 0.8rem; color: #666; margin-bottom: 3px;">
          <i class="fa-solid fa-user" style="width: 14px;"></i> ${assignee}
        </div>
        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: rgba(33,150,243,0.1); color: #1976d2;">${statusLabel}</span>
          <span style="font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: rgba(255,152,0,0.1); color: #f57c00;">${priorityLabel}</span>
        </div>
      </div>
    `;
  }

  private createWorkerPopup(worker: Employee): string {
    const name = worker.user ? `${worker.user.firstName} ${worker.user.lastName}` : 'Technicien';
    return `
      <div style="min-width: 180px; font-family: 'Urbanist', sans-serif;">
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: #1a1a2e;">
          <i class="fa-solid fa-user-hard-hat" style="color: #1565c0;"></i> ${name}
        </div>
        ${worker.currentAddress ? `<div style="font-size: 0.8rem; color: #666; margin-bottom: 3px;"><i class="fa-solid fa-location-dot" style="width: 14px;"></i> ${worker.currentAddress}</div>` : ''}
        <div style="font-size: 0.8rem; color: #666; margin-bottom: 3px;">
          <i class="fa-solid fa-trophy" style="width: 14px; color: #ff9800;"></i> ${worker.totalPoints || 0} pts
        </div>
        <div style="font-size: 0.8rem; color: #666;">
          <i class="fa-solid fa-clipboard-check" style="width: 14px; color: #4caf50;"></i> ${worker.totalMissionsCompleted || 0} missions
        </div>
      </div>
    `;
  }

  // GPS Tracking
  private startGPSTracking(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.updateMyLocation(latitude, longitude);

        // Update employee location on backend
        const employee = this.authService.currentEmployee?.();
        if (employee?.id) {
          this.employeeService.updateLocation(employee.id, latitude, longitude).subscribe({
            error: (err) => console.error('Failed to update location:', err)
          });
        }
      },
      (error) => {
        console.warn('GPS error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }

  private updateMyLocation(lat: number, lng: number): void {
    if (this.myLocationMarker) {
      this.myLocationMarker.setLatLng([lat, lng]);
    } else {
      this.myLocationMarker = L.marker([lat, lng], { icon: this.myLocationIcon })
        .addTo(this.map)
        .bindPopup('<div style="font-family: Urbanist, sans-serif; font-weight: 600;">Ma position</div>');
    }
  }

  // Public methods
  togglePanel(): void {
    this.panelOpen.update(v => !v);
    setTimeout(() => this.map.invalidateSize(), 350);
  }

  centerOnMyLocation(): void {
    if (this.myLocationMarker) {
      const latlng = this.myLocationMarker.getLatLng();
      this.map.setView(latlng, 16, { animate: true });
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 16, { animate: true });
          this.updateMyLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => console.warn('Could not get location')
      );
    }
  }

  fitAllMarkers(): void {
    const allMarkers = [...this.missionMarkers, ...this.workerMarkers];
    if (this.myLocationMarker) allMarkers.push(this.myLocationMarker);

    if (allMarkers.length > 0) {
      const group = L.featureGroup(allMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1), { animate: true });
    }
  }

  focusMission(mission: Mission): void {
    this.selectedMissionId.set(mission.id);
    if (mission.latitude && mission.longitude) {
      this.map.setView([mission.latitude, mission.longitude], 16, { animate: true });

      // Open popup for this mission's marker
      const idx = this.missions().findIndex(m => m.id === mission.id);
      // Find matching marker by position
      this.missionMarkers.forEach(marker => {
        const latlng = marker.getLatLng();
        if (Math.abs(latlng.lat - mission.latitude!) < 0.0001 && Math.abs(latlng.lng - mission.longitude!) < 0.0001) {
          marker.openPopup();
        }
      });
    }
  }

  focusWorker(worker: Employee): void {
    this.selectedWorkerId.set(worker.id);
    if (worker.currentLatitude && worker.currentLongitude) {
      this.map.setView([worker.currentLatitude, worker.currentLongitude], 16, { animate: true });

      this.workerMarkers.forEach(marker => {
        const latlng = marker.getLatLng();
        if (Math.abs(latlng.lat - worker.currentLatitude!) < 0.0001 && Math.abs(latlng.lng - worker.currentLongitude!) < 0.0001) {
          marker.openPopup();
        }
      });
    }
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
