import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  SalaryAdvance, 
  SALARY_ADVANCE_STATUS_LABELS 
} from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-salary-advance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="salary-advance-page">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fa-solid fa-money-bill-wave"></i> Avances sur Salaire</h1>
          <p class="subtitle">Gérez vos demandes d'avance sur salaire</p>
        </div>
        <button class="btn btn-primary" (click)="openRequestModal()">
          <i class="fa-solid fa-plus"></i> Nouvelle demande
        </button>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <i class="fa-solid fa-circle-info"></i>
        <p>Les demandes d'avance sur salaire doivent être soumises au moins <strong>15 jours</strong> avant la date souhaitée.</p>
      </div>

      <!-- Tabs for Admin -->
      @if (isAdmin()) {
        <div class="tabs">
          <button class="tab" [class.active]="activeTab() === 'my'" (click)="activeTab.set('my')">
            Mes demandes
          </button>
          <button class="tab" [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending'); loadPendingAdvances()">
            En attente ({{ pendingCount() }})
          </button>
          <button class="tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all'); loadAllAdvances()">
            Toutes les demandes
          </button>
        </div>
      }

      <!-- Advances List -->
      <div class="advances-list">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement...</p>
          </div>
        } @else if (displayedAdvances().length === 0) {
          <div class="empty-state">
            <i class="fa-solid fa-file-invoice-dollar"></i>
            <h3>Aucune demande</h3>
            <p>Vous n'avez pas encore fait de demande d'avance sur salaire.</p>
            <button class="btn btn-primary" (click)="openRequestModal()">
              Faire une demande
            </button>
          </div>
        } @else {
          @for (advance of displayedAdvances(); track advance.id) {
            <div class="advance-card" [class]="'status-' + advance.status.toLowerCase()">
              <div class="advance-header">
                <div class="advance-amount">{{ advance.amount | currency:'EUR':'symbol':'1.0-2':'fr-FR' }}</div>
                <span class="status-badge" [class]="'badge-' + advance.status.toLowerCase()">
                  {{ SALARY_ADVANCE_STATUS_LABELS[advance.status] }}
                </span>
              </div>
              <div class="advance-details">
                @if (isAdmin() && activeTab() !== 'my') {
                  <div class="detail-item">
                    <i class="fa-solid fa-user"></i>
                    <span>{{ advance.employeeName }}</span>
                  </div>
                }
                <div class="detail-item">
                  <i class="fa-regular fa-calendar"></i>
                  <span>Date souhaitée: {{ advance.requestedDate | date:'dd MMMM yyyy':'':'fr-FR' }}</span>
                </div>
                @if (advance.reason) {
                  <div class="detail-item">
                    <i class="fa-solid fa-comment"></i>
                    <span>{{ advance.reason }}</span>
                  </div>
                }
                @if (advance.rejectionReason) {
                  <div class="detail-item rejection">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <span>Motif de rejet: {{ advance.rejectionReason }}</span>
                  </div>
                }
                @if (advance.paidDate) {
                  <div class="detail-item paid">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Payée le: {{ advance.paidDate | date:'dd MMMM yyyy':'':'fr-FR' }}</span>
                  </div>
                }
              </div>
              <div class="advance-footer">
                <span class="created-date">Demandée le {{ advance.createdAt | date:'dd/MM/yyyy' }}</span>
                @if (isAdmin() && advance.status === 'PENDING') {
                  <div class="admin-actions">
                    <button class="btn btn-sm btn-success" (click)="approveAdvance(advance)">
                      <i class="fa-solid fa-check"></i> Approuver
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="openRejectModal(advance)">
                      <i class="fa-solid fa-xmark"></i> Rejeter
                    </button>
                  </div>
                }
                @if (isAdmin() && advance.status === 'APPROVED') {
                  <div class="admin-actions">
                    <button class="btn btn-sm btn-primary" (click)="markAsPaid(advance)">
                      <i class="fa-solid fa-coins"></i> Marquer payée
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Request Modal -->
    @if (showRequestModal()) {
      <div class="modal-overlay" (click)="closeRequestModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fa-solid fa-money-bill-wave"></i> Nouvelle demande d'avance</h2>
            <button class="close-btn" (click)="closeRequestModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="submitRequest()">
            <div class="form-group">
              <label>Montant (€)</label>
              <input type="number" [(ngModel)]="requestForm.amount" name="amount" 
                     min="1" step="0.01" required placeholder="0.00" />
            </div>
            <div class="form-group">
              <label>Date souhaitée</label>
              <input type="date" [(ngModel)]="requestForm.requestedDate" name="requestedDate" 
                     [min]="minDate" required />
              <span class="help-text">Minimum 15 jours à l'avance</span>
            </div>
            <div class="form-group">
              <label>Motif (optionnel)</label>
              <textarea [(ngModel)]="requestForm.reason" name="reason" 
                        rows="3" placeholder="Expliquez votre besoin..."></textarea>
            </div>
            @if (requestError()) {
              <div class="error-message">
                <i class="fa-solid fa-circle-exclamation"></i> {{ requestError() }}
              </div>
            }
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closeRequestModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Envoi...' : 'Soumettre la demande' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Reject Modal -->
    @if (showRejectModal()) {
      <div class="modal-overlay" (click)="closeRejectModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fa-solid fa-xmark"></i> Rejeter la demande</h2>
            <button class="close-btn" (click)="closeRejectModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="submitReject()">
            <div class="form-group">
              <label>Motif du rejet</label>
              <textarea [(ngModel)]="rejectReason" name="rejectReason" 
                        rows="3" required placeholder="Expliquez le motif du rejet..."></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closeRejectModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-danger" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Envoi...' : 'Confirmer le rejet' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .salary-advance-page {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
    }

    .page-header h1 i {
      color: var(--primary-color);
    }

    .subtitle {
      color: var(--text-light);
      margin: 0.25rem 0 0;
    }

    .info-card {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .info-card i {
      color: #3b82f6;
      font-size: 1.25rem;
    }

    .info-card p {
      margin: 0;
      color: #1e40af;
      font-size: 0.875rem;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .tab {
      background: none;
      border: none;
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-light);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .advances-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .advance-card {
      background: var(--card-background);
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      transition: box-shadow 0.2s;
    }

    .advance-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .advance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .advance-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-approved {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-paid {
      background: #e0e7ff;
      color: #3730a3;
    }

    .advance-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .detail-item i {
      width: 16px;
      color: var(--text-light);
    }

    .detail-item.rejection {
      color: #dc2626;
    }

    .detail-item.rejection i {
      color: #dc2626;
    }

    .detail-item.paid {
      color: #16a34a;
    }

    .detail-item.paid i {
      color: #16a34a;
    }

    .advance-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .created-date {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .admin-actions {
      display: flex;
      gap: 0.5rem;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state i {
      font-size: 4rem;
      color: var(--text-light);
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: var(--text-light);
      margin-bottom: 1.5rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--card-background);
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-light);
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--text-color);
    }

    .modal-content form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .help-text {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 0.25rem;
      display: block;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Button styles */
    .btn {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-color);
    }

    .btn-outline:hover {
      background: var(--background-color);
    }

    .btn-success {
      background: #16a34a;
      color: white;
    }

    .btn-success:hover {
      background: #15803d;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    .btn-sm {
      padding: 0.5rem 0.875rem;
      font-size: 0.75rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .salary-advance-page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .advance-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .admin-actions {
        width: 100%;
      }

      .admin-actions .btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class SalaryAdvanceListComponent implements OnInit {
  private readonly salaryAdvanceService = inject(SalaryAdvanceService);
  private readonly authService = inject(AuthService);

  isAdmin = this.authService.isAdmin;
  
  isLoading = signal(true);
  isSubmitting = signal(false);
  
  myAdvances = signal<SalaryAdvance[]>([]);
  pendingAdvances = signal<SalaryAdvance[]>([]);
  allAdvances = signal<SalaryAdvance[]>([]);
  
  activeTab = signal<'my' | 'pending' | 'all'>('my');
  
  showRequestModal = signal(false);
  showRejectModal = signal(false);
  
  requestError = signal('');
  rejectReason = '';
  selectedAdvance: SalaryAdvance | null = null;
  
  requestForm = {
    amount: null as number | null,
    requestedDate: '',
    reason: ''
  };

  minDate = this.getMinDate();

  SALARY_ADVANCE_STATUS_LABELS = SALARY_ADVANCE_STATUS_LABELS;

  displayedAdvances = signal<SalaryAdvance[]>([]);
  pendingCount = signal(0);

  ngOnInit(): void {
    this.loadMyAdvances();
    if (this.isAdmin()) {
      this.loadPendingCount();
    }
  }

  private getMinDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  }

  loadMyAdvances(): void {
    this.isLoading.set(true);
    this.salaryAdvanceService.getMyAdvances().subscribe({
      next: (advances) => {
        this.myAdvances.set(advances);
        this.displayedAdvances.set(advances);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load advances:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPendingAdvances(): void {
    this.isLoading.set(true);
    this.salaryAdvanceService.getPendingAdvances().subscribe({
      next: (advances) => {
        this.pendingAdvances.set(advances);
        this.displayedAdvances.set(advances);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load pending advances:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadAllAdvances(): void {
    this.isLoading.set(true);
    this.salaryAdvanceService.getAllAdvances().subscribe({
      next: (advances) => {
        this.allAdvances.set(advances);
        this.displayedAdvances.set(advances);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load all advances:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPendingCount(): void {
    this.salaryAdvanceService.getPendingAdvances().subscribe({
      next: (advances) => this.pendingCount.set(advances.length),
      error: () => {}
    });
  }

  openRequestModal(): void {
    this.showRequestModal.set(true);
    this.requestError.set('');
    this.requestForm = {
      amount: null,
      requestedDate: this.minDate,
      reason: ''
    };
  }

  closeRequestModal(): void {
    this.showRequestModal.set(false);
  }

  submitRequest(): void {
    if (!this.requestForm.amount || !this.requestForm.requestedDate) {
      this.requestError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting.set(true);
    this.requestError.set('');

    this.salaryAdvanceService.createAdvance({
      amount: this.requestForm.amount,
      requestedDate: this.requestForm.requestedDate,
      reason: this.requestForm.reason
    }).subscribe({
      next: () => {
        this.closeRequestModal();
        this.isSubmitting.set(false);
        this.loadMyAdvances();
      },
      error: (err) => {
        this.requestError.set(err.error?.error || 'Erreur lors de la création de la demande');
        this.isSubmitting.set(false);
      }
    });
  }

  approveAdvance(advance: SalaryAdvance): void {
    this.salaryAdvanceService.approveAdvance(advance.id).subscribe({
      next: () => {
        this.refreshCurrentTab();
        this.loadPendingCount();
      },
      error: (err) => console.error('Failed to approve:', err)
    });
  }

  openRejectModal(advance: SalaryAdvance): void {
    this.selectedAdvance = advance;
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.selectedAdvance = null;
  }

  submitReject(): void {
    if (!this.selectedAdvance || !this.rejectReason) return;

    this.isSubmitting.set(true);
    this.salaryAdvanceService.rejectAdvance(this.selectedAdvance.id, this.rejectReason).subscribe({
      next: () => {
        this.closeRejectModal();
        this.isSubmitting.set(false);
        this.refreshCurrentTab();
        this.loadPendingCount();
      },
      error: (err) => {
        console.error('Failed to reject:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  markAsPaid(advance: SalaryAdvance): void {
    this.salaryAdvanceService.markAsPaid(advance.id).subscribe({
      next: () => this.refreshCurrentTab(),
      error: (err) => console.error('Failed to mark as paid:', err)
    });
  }

  private refreshCurrentTab(): void {
    switch (this.activeTab()) {
      case 'my':
        this.loadMyAdvances();
        break;
      case 'pending':
        this.loadPendingAdvances();
        break;
      case 'all':
        this.loadAllAdvances();
        break;
    }
  }
}
