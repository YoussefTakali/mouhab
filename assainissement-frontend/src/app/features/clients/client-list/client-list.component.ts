import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Client, ClientType, CLIENT_TYPE_LABELS } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="client-list-page">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fa-solid fa-building-user"></i> Gestion des Clients</h1>
          <p>{{ filteredClients().length }} client(s)</p>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <i class="fa-solid fa-plus"></i> Nouveau Client
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fa-solid fa-users"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ clients().length }}</span>
            <span class="stat-label">Total Clients</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ activeCount() }}</span>
            <span class="stat-label">Actifs</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fa-solid fa-file-contract"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ contractCount() }}</span>
            <span class="stat-label">Sous contrat</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="fa-solid fa-clipboard-list"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ totalMissions() }}</span>
            <span class="stat-label">Total Missions</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input
            type="text"
            placeholder="Rechercher un client..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
          />
          <span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
            <option value="">Tous les types</option>
            @for (type of clientTypes; track type) {
              <option [value]="type">{{ CLIENT_TYPE_LABELS[type] }}</option>
            }
          </select>
          <select [(ngModel)]="filterActive" (ngModelChange)="applyFilters()">
            <option value="">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      <!-- Client List -->
      @if (isLoading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement des clients...</p>
        </div>
      } @else if (filteredClients().length === 0) {
        <div class="empty-state">
          <i class="fa-solid fa-building-user"></i>
          <h3>Aucun client trouvé</h3>
          <p>Ajoutez votre premier client pour commencer</p>
          <button class="btn btn-primary" (click)="showCreateModal.set(true)">
            <i class="fa-solid fa-plus"></i> Ajouter un client
          </button>
        </div>
      } @else {
        <div class="clients-grid">
          @for (client of filteredClients(); track client.id) {
            <div class="client-card" [class.inactive]="!client.active">
              <div class="card-header">
                <div class="client-avatar" [class]="'type-' + client.type?.toLowerCase()">
                  {{ client.name.charAt(0) }}
                </div>
                <div class="client-main-info">
                  <h3>
                    <a [routerLink]="['/clients', client.id]">{{ client.name }}</a>
                  </h3>
                  <span class="client-type-badge" [class]="'type-' + client.type?.toLowerCase()">
                    {{ CLIENT_TYPE_LABELS[client.type] || client.type }}
                  </span>
                </div>
                <div class="client-status">
                  <span class="status-dot" [class.active]="client.active" [class.inactive]="!client.active"></span>
                </div>
              </div>

              <div class="card-details">
                @if (client.contactPerson) {
                  <div class="detail-row">
                    <i class="fa-solid fa-user"></i>
                    <span>{{ client.contactPerson }}</span>
                  </div>
                }
                @if (client.phone) {
                  <div class="detail-row">
                    <i class="fa-solid fa-phone"></i>
                    <span>{{ client.phone }}</span>
                  </div>
                }
                @if (client.email) {
                  <div class="detail-row">
                    <i class="fa-solid fa-envelope"></i>
                    <span>{{ client.email }}</span>
                  </div>
                }
                @if (client.address) {
                  <div class="detail-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>{{ client.address }}{{ client.city ? ', ' + client.city : '' }}</span>
                  </div>
                }
              </div>

              <div class="card-stats">
                <div class="stat">
                  <span class="stat-num">{{ client.totalMissions }}</span>
                  <span class="stat-lbl">Missions</span>
                </div>
                <div class="stat">
                  <span class="stat-num">{{ client.completedMissions }}</span>
                  <span class="stat-lbl">Terminées</span>
                </div>
                <div class="stat">
                  <span class="stat-num">{{ (client.totalPaid || 0) | number:'1.0-0' }} DH</span>
                  <span class="stat-lbl">Payé</span>
                </div>
                <div class="stat">
                  <span class="stat-num balance" [class.negative]="(client.totalDue || 0) > 0">{{ (client.totalDue || 0) | number:'1.0-0' }} DH</span>
                  <span class="stat-lbl">Dû</span>
                </div>
              </div>

              <div class="card-actions">
                <a [routerLink]="['/clients', client.id]" class="btn-action primary">
                  <i class="fa-solid fa-eye"></i> Détails
                </a>
                @if (client.hasContract) {
                  <span class="contract-badge"><i class="fa-solid fa-file-contract"></i> Contrat</span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Create Client Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2><i class="fa-solid fa-plus"></i> Nouveau Client</h2>
              <button class="close-btn" (click)="closeModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form [formGroup]="clientForm" (ngSubmit)="onCreateClient()" class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" formControlName="name" placeholder="Nom du client" />
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <select formControlName="type">
                    @for (type of clientTypes; track type) {
                      <option [value]="type">{{ CLIENT_TYPE_LABELS[type] }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Personne de contact</label>
                  <input type="text" formControlName="contactPerson" placeholder="Nom du contact" />
                </div>
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" formControlName="phone" placeholder="06 12 34 56 78" />
                </div>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="email" formControlName="email" placeholder="email@exemple.com" />
              </div>

              <div class="form-group">
                <label>Adresse</label>
                <input type="text" formControlName="address" placeholder="Adresse complète" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Ville</label>
                  <input type="text" formControlName="city" placeholder="Ville" />
                </div>
                <div class="form-group">
                  <label>Code postal</label>
                  <input type="text" formControlName="postalCode" placeholder="Code postal" />
                </div>
              </div>

              <div class="form-group">
                <label>Notes</label>
                <textarea formControlName="notes" rows="3" placeholder="Notes supplémentaires..."></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="clientForm.invalid || isCreating()">
                  @if (isCreating()) {
                    <span class="spinner-sm"></span> Création...
                  } @else {
                    <i class="fa-solid fa-plus"></i> Créer
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .client-list-page { max-width: 1400px; margin: 0 auto; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header p {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

    .btn-outline {
      background: white;
      border: 2px solid var(--border-color);
      color: var(--text-color);
    }

    .btn-outline:hover { border-color: var(--primary-color); color: var(--primary-color); }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .stat-icon.blue { background: rgba(21,101,192,0.1); color: #1565c0; }
    .stat-icon.green { background: rgba(76,175,80,0.1); color: #388e3c; }
    .stat-icon.orange { background: rgba(255,152,0,0.1); color: #f57c00; }
    .stat-icon.purple { background: rgba(156,39,176,0.1); color: #7b1fa2; }

    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-color); }
    .stat-label { font-size: 0.78rem; color: var(--text-light); }

    /* Filters */
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;
    }

    .search-box input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-size: 0.95rem;
    }

    .search-box input:focus { outline: none; border-color: var(--primary-color); }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .filter-group { display: flex; gap: 0.75rem; }

    .filter-group select {
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-size: 0.9rem;
      cursor: pointer;
      min-width: 160px;
    }

    .filter-group select:focus { outline: none; border-color: var(--primary-color); }

    /* Client Grid */
    .clients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.25rem;
    }

    .client-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .client-card:hover { border-color: var(--primary-color); box-shadow: 0 4px 16px rgba(21,101,192,0.1); }
    .client-card.inactive { opacity: 0.65; }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .client-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .client-avatar.type-particulier { background: linear-gradient(135deg, #1565c0, #1e88e5); }
    .client-avatar.type-entreprise { background: linear-gradient(135deg, #7b1fa2, #9c27b0); }
    .client-avatar.type-municipalite { background: linear-gradient(135deg, #e65100, #f57c00); }
    .client-avatar.type-syndic { background: linear-gradient(135deg, #00695c, #00897b); }
    .client-avatar.type-collectivite { background: linear-gradient(135deg, #4527a0, #5e35b1); }
    .client-avatar.type-administration { background: linear-gradient(135deg, #283593, #3949ab); }
    .client-avatar.type-other { background: linear-gradient(135deg, #424242, #616161); }

    .client-main-info { flex: 1; min-width: 0; }

    .client-main-info h3 {
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .client-main-info h3 a {
      color: var(--text-color);
      text-decoration: none;
    }

    .client-main-info h3 a:hover { color: var(--primary-color); }

    .client-type-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .client-type-badge.type-particulier { background: rgba(21,101,192,0.1); color: #1565c0; }
    .client-type-badge.type-entreprise { background: rgba(156,39,176,0.1); color: #7b1fa2; }
    .client-type-badge.type-municipalite { background: rgba(255,152,0,0.1); color: #f57c00; }
    .client-type-badge.type-syndic { background: rgba(0,150,136,0.1); color: #00897b; }
    .client-type-badge.type-collectivite { background: rgba(156,39,176,0.1); color: #5e35b1; }
    .client-type-badge.type-administration { background: rgba(63,81,181,0.1); color: #3949ab; }
    .client-type-badge.type-other { background: rgba(158,158,158,0.1); color: #616161; }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .status-dot.active { background: #4caf50; box-shadow: 0 0 0 3px rgba(76,175,80,0.2); }
    .status-dot.inactive { background: #9e9e9e; }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--text-light);
    }

    .detail-row i {
      width: 16px;
      text-align: center;
      font-size: 0.7rem;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .card-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    .card-stats .stat {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .card-stats .stat-num {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .card-stats .stat-num.balance.negative { color: #e53935; }

    .card-stats .stat-lbl {
      font-size: 0.65rem;
      color: var(--text-light);
      text-transform: uppercase;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-action {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }

    .btn-action.primary {
      background: rgba(21,101,192,0.08);
      color: var(--primary-color);
    }

    .btn-action.primary:hover { background: var(--primary-color); color: white; }

    .contract-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: #f57c00;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    /* Loading / Empty */
    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: var(--text-light);
    }

    .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state h3 { color: var(--text-color); margin-bottom: 0.5rem; }
    .empty-state p { margin-bottom: 1.5rem; }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal {
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-light);
      padding: 0.5rem;
    }

    .close-btn:hover { color: var(--text-color); }

    .modal-body { padding: 1.5rem 2rem; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .form-group { margin-bottom: 1rem; }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.4rem;
      font-size: 0.85rem;
      color: var(--text-color);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-group textarea { resize: vertical; }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1rem 2rem 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .clients-grid { grid-template-columns: 1fr; }
      .filters-section { flex-direction: column; }
      .filter-group { flex-direction: column; }
      .form-row { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 1rem; }
    }
  `]
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly fb = inject(FormBuilder);

  clients = signal<Client[]>([]);
  filteredClients = signal<Client[]>([]);
  isLoading = signal(true);
  showCreateModal = signal(false);
  isCreating = signal(false);

  searchQuery = '';
  filterType = '';
  filterActive = '';

  clientTypes = Object.keys(CLIENT_TYPE_LABELS) as ClientType[];
  CLIENT_TYPE_LABELS = CLIENT_TYPE_LABELS;

  clientForm: FormGroup;

  activeCount = computed(() => this.clients().filter(c => c.active).length);
  contractCount = computed(() => this.clients().filter(c => c.hasContract).length);
  totalMissions = computed(() => this.clients().reduce((sum, c) => sum + (c.totalMissions || 0), 0));

  constructor() {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['PARTICULIER'],
      contactPerson: [''],
      phone: [''],
      email: [''],
      address: [''],
      city: [''],
      postalCode: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  applyFilters(): void {
    let result = this.clients();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    }

    if (this.filterType) {
      result = result.filter(c => c.type === this.filterType);
    }

    if (this.filterActive === 'active') {
      result = result.filter(c => c.active);
    } else if (this.filterActive === 'inactive') {
      result = result.filter(c => !c.active);
    }

    this.filteredClients.set(result);
  }

  onCreateClient(): void {
    if (this.clientForm.invalid) return;
    this.isCreating.set(true);

    this.clientService.createClient(this.clientForm.value).subscribe({
      next: () => {
        this.closeModal();
        this.loadClients();
        this.isCreating.set(false);
      },
      error: () => this.isCreating.set(false)
    });
  }

  closeModal(): void {
    this.showCreateModal.set(false);
    this.clientForm.reset({ type: 'PARTICULIER' });
  }
}
