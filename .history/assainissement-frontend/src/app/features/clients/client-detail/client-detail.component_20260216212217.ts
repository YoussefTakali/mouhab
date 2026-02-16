import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Client, ClientType, CLIENT_TYPE_LABELS, Payment, PaymentStatus, PaymentMethod, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../../../core/models/client.model';
import { Mission, MISSION_STATUS_LABELS, MISSION_TYPE_LABELS } from '../../../core/models/mission.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <div class="spinner-large"></div>
        <p>Chargement...</p>
      </div>
    } @else if (!client()) {
      <div class="error-state">
        <i class="fa-solid fa-face-frown error-icon"></i>
        <h2>Client non trouvé</h2>
        <a routerLink="/clients" class="btn btn-primary">Retour aux clients</a>
      </div>
    } @else {
      <div class="client-detail-page">
        <a routerLink="/clients" class="back-link">
          <i class="fa-solid fa-arrow-left"></i> Retour aux clients
        </a>

        <!-- Header -->
        <div class="client-header">
          <div class="header-bg"></div>
          <div class="header-content">
            <div class="client-avatar" [class]="'type-' + client()!.type?.toLowerCase()">
              {{ client()!.name.charAt(0) }}
            </div>
            <div class="client-info">
              <h1>{{ client()!.name }}</h1>
              <span class="type-badge" [class]="'type-' + client()!.type?.toLowerCase()">
                {{ CLIENT_TYPE_LABELS[client()!.type] || client()!.type }}
              </span>
              <div class="header-meta">
                @if (client()!.contactPerson) {
                  <span><i class="fa-solid fa-user"></i> {{ client()!.contactPerson }}</span>
                }
                @if (client()!.city) {
                  <span><i class="fa-solid fa-location-dot"></i> {{ client()!.city }}</span>
                }
              </div>
            </div>
            <div class="header-actions">
              <button class="btn btn-outline" (click)="toggleActive()">
                @if (client()!.active) {
                  <i class="fa-solid fa-ban"></i> Désactiver
                } @else {
                  <i class="fa-solid fa-check"></i> Activer
                }
              </button>
              <button class="btn btn-primary" (click)="isEditing.set(!isEditing())">
                <i class="fa-solid fa-pen"></i> Modifier
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-clipboard-list"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ client()!.totalMissions || 0 }}</span>
              <span class="stat-label">Total Missions</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ client()!.completedMissions || 0 }}</span>
              <span class="stat-label">Terminées</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fa-solid fa-spinner"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ client()!.inProgressMissions || 0 }}</span>
              <span class="stat-label">En cours</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" [class.green]="(client()!.balance || 0) >= 0" [class.red]="(client()!.balance || 0) < 0">
              <i class="fa-solid fa-coins"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ (client()!.totalPaid || 0) | number:'1.0-0' }} DH</span>
              <span class="stat-label">Total payé</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab" [class.active]="activeTab() === 'info'" (click)="activeTab.set('info')">
            <i class="fa-solid fa-circle-info"></i> Informations
          </button>
          <button class="tab" [class.active]="activeTab() === 'missions'" (click)="activeTab.set('missions'); loadMissions()">
            <i class="fa-solid fa-bullseye"></i> Missions
            @if (client()!.totalMissions) {
              <span class="tab-badge">{{ client()!.totalMissions }}</span>
            }
          </button>
          <button class="tab" [class.active]="activeTab() === 'payments'" (click)="activeTab.set('payments'); loadPayments()">
            <i class="fa-solid fa-money-bill-wave"></i> Paiements
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Info Tab -->
          @if (activeTab() === 'info') {
            @if (isEditing()) {
              <div class="edit-card">
                <h2><i class="fa-solid fa-pen"></i> Modifier le client</h2>
                <form [formGroup]="editForm" (ngSubmit)="onSave()">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Nom *</label>
                      <input type="text" formControlName="name" />
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
                      <input type="text" formControlName="contactPerson" />
                    </div>
                    <div class="form-group">
                      <label>Téléphone</label>
                      <input type="tel" formControlName="phone" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" formControlName="email" />
                  </div>
                  <div class="form-group">
                    <label>Adresse</label>
                    <input type="text" formControlName="address" />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Ville</label>
                      <input type="text" formControlName="city" />
                    </div>
                    <div class="form-group">
                      <label>Code postal</label>
                      <input type="text" formControlName="postalCode" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Adresse de facturation</label>
                      <input type="text" formControlName="billingAddress" />
                    </div>
                    <div class="form-group">
                      <label>SIRET</label>
                      <input type="text" formControlName="siret" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>N° TVA</label>
                      <input type="text" formControlName="vatNumber" />
                    </div>
                    <div class="form-group checkbox-group">
                      <label>
                        <input type="checkbox" formControlName="hasContract" />
                        Sous contrat
                      </label>
                    </div>
                  </div>
                  @if (editForm.get('hasContract')?.value) {
                    <div class="form-row">
                      <div class="form-group">
                        <label>Début du contrat</label>
                        <input type="date" formControlName="contractStartDate" />
                      </div>
                      <div class="form-group">
                        <label>Fin du contrat</label>
                        <input type="date" formControlName="contractEndDate" />
                      </div>
                    </div>
                  }
                  <div class="form-group">
                    <label>Notes</label>
                    <textarea formControlName="notes" rows="3"></textarea>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-outline" (click)="isEditing.set(false)">Annuler</button>
                    <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || isSaving()">
                      @if (isSaving()) {
                        <span class="spinner-sm"></span> Enregistrement...
                      } @else {
                        <i class="fa-solid fa-save"></i> Enregistrer
                      }
                    </button>
                  </div>
                </form>
              </div>
            } @else {
              <div class="info-grid">
                <div class="info-card">
                  <h3><i class="fa-solid fa-address-card"></i> Contact</h3>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-icon"><i class="fa-solid fa-building"></i></span>
                      <div>
                        <span class="info-label">Nom</span>
                        <span class="info-value">{{ client()!.name }}</span>
                      </div>
                    </div>
                    @if (client()!.contactPerson) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-user"></i></span>
                        <div>
                          <span class="info-label">Personne de contact</span>
                          <span class="info-value">{{ client()!.contactPerson }}</span>
                        </div>
                      </div>
                    }
                    @if (client()!.phone) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-phone"></i></span>
                        <div>
                          <span class="info-label">Téléphone</span>
                          <span class="info-value">{{ client()!.phone }}</span>
                        </div>
                      </div>
                    }
                    @if (client()!.email) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-envelope"></i></span>
                        <div>
                          <span class="info-label">Email</span>
                          <span class="info-value">{{ client()!.email }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="info-card">
                  <h3><i class="fa-solid fa-location-dot"></i> Adresse</h3>
                  <div class="info-list">
                    @if (client()!.address) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-map-pin"></i></span>
                        <div>
                          <span class="info-label">Adresse</span>
                          <span class="info-value">{{ client()!.address }}</span>
                        </div>
                      </div>
                    }
                    @if (client()!.city) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-city"></i></span>
                        <div>
                          <span class="info-label">Ville</span>
                          <span class="info-value">{{ client()!.city }} {{ client()!.postalCode ? '(' + client()!.postalCode + ')' : '' }}</span>
                        </div>
                      </div>
                    }
                    @if (client()!.billingAddress) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-file-invoice"></i></span>
                        <div>
                          <span class="info-label">Facturation</span>
                          <span class="info-value">{{ client()!.billingAddress }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="info-card">
                  <h3><i class="fa-solid fa-file-contract"></i> Contractuel</h3>
                  <div class="info-list">
                    @if (client()!.siret) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-barcode"></i></span>
                        <div>
                          <span class="info-label">SIRET</span>
                          <span class="info-value">{{ client()!.siret }}</span>
                        </div>
                      </div>
                    }
                    @if (client()!.vatNumber) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-solid fa-receipt"></i></span>
                        <div>
                          <span class="info-label">N° TVA</span>
                          <span class="info-value">{{ client()!.vatNumber }}</span>
                        </div>
                      </div>
                    }
                    <div class="info-item">
                      <span class="info-icon"><i class="fa-solid fa-handshake"></i></span>
                      <div>
                        <span class="info-label">Contrat</span>
                        <span class="info-value">{{ client()!.hasContract ? 'Oui' : 'Non' }}</span>
                      </div>
                    </div>
                    @if (client()!.hasContract && client()!.contractStartDate) {
                      <div class="info-item">
                        <span class="info-icon"><i class="fa-regular fa-calendar"></i></span>
                        <div>
                          <span class="info-label">Période</span>
                          <span class="info-value">
                            {{ client()!.contractStartDate | date:'dd/MM/yyyy' }}
                            @if (client()!.contractEndDate) {
                              → {{ client()!.contractEndDate | date:'dd/MM/yyyy' }}
                            }
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                @if (client()!.notes) {
                  <div class="info-card full-width">
                    <h3><i class="fa-solid fa-sticky-note"></i> Notes</h3>
                    <p class="notes-text">{{ client()!.notes }}</p>
                  </div>
                }

                <!-- Financial Summary -->
                <div class="info-card full-width financial-summary">
                  <h3><i class="fa-solid fa-chart-pie"></i> Résumé Financier</h3>
                  <div class="finance-grid">
                    <div class="finance-item paid">
                      <span class="finance-label">Total Payé</span>
                      <span class="finance-value">{{ (client()!.totalPaid || 0) | number:'1.2-2' }} DH</span>
                    </div>
                    <div class="finance-item due">
                      <span class="finance-label">Total Dû</span>
                      <span class="finance-value">{{ (client()!.totalDue || 0) | number:'1.2-2' }} DH</span>
                    </div>
                    <div class="finance-item balance" [class.positive]="(client()!.balance || 0) >= 0" [class.negative]="(client()!.balance || 0) < 0">
                      <span class="finance-label">Solde</span>
                      <span class="finance-value">{{ (client()!.balance || 0) | number:'1.2-2' }} DH</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          }

          <!-- Missions Tab -->
          @if (activeTab() === 'missions') {
            <div class="missions-section">
              @if (missionsLoading()) {
                <div class="tab-loading"><div class="spinner"></div></div>
              } @else if (missions().length === 0) {
                <div class="empty-mini">
                  <i class="fa-solid fa-bullseye"></i>
                  <p>Aucune mission pour ce client</p>
                </div>
              } @else {
                <div class="missions-list">
                  @for (mission of missions(); track mission.id) {
                    <a [routerLink]="['/missions', mission.id]" class="mission-row">
                      <div class="mission-left">
                        <span class="mission-status-dot" [class]="'status-' + mission.status.toLowerCase()"></span>
                        <div class="mission-details">
                          <span class="mission-title">{{ mission.title }}</span>
                          <span class="mission-meta">
                            {{ MISSION_TYPE_LABELS[mission.type] || mission.type }}
                            • {{ mission.scheduledDate | date:'dd/MM/yyyy' }}
                            @if (mission.address) {
                              • {{ mission.address }}
                            }
                          </span>
                        </div>
                      </div>
                      <span class="mission-status-badge" [class]="'status-' + mission.status.toLowerCase()">
                        {{ MISSION_STATUS_LABELS[mission.status] || mission.status }}
                      </span>
                    </a>
                  }
                </div>
              }
            </div>
          }

          <!-- Payments Tab -->
          @if (activeTab() === 'payments') {
            <div class="payments-section">
              <div class="payments-header">
                <h3>Historique des paiements</h3>
                <button class="btn btn-primary btn-sm" (click)="showPaymentModal.set(true)">
                  <i class="fa-solid fa-plus"></i> Nouveau Paiement
                </button>
              </div>

              @if (paymentsLoading()) {
                <div class="tab-loading"><div class="spinner"></div></div>
              } @else if (payments().length === 0) {
                <div class="empty-mini">
                  <i class="fa-solid fa-money-bill-wave"></i>
                  <p>Aucun paiement enregistré</p>
                </div>
              } @else {
                <div class="payments-table-wrap">
                  <table class="payments-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Référence</th>
                        <th>Mission</th>
                        <th>Méthode</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (payment of payments(); track payment.id) {
                        <tr>
                          <td>{{ payment.paymentDate | date:'dd/MM/yyyy' }}</td>
                          <td>{{ payment.reference || payment.invoiceNumber || '-' }}</td>
                          <td>{{ payment.missionTitle || '-' }}</td>
                          <td>{{ PAYMENT_METHOD_LABELS[payment.method] || payment.method }}</td>
                          <td class="amount">{{ payment.amount | number:'1.2-2' }} DH</td>
                          <td>
                            <span class="payment-status" [class]="'payment-' + payment.status.toLowerCase()">
                              {{ PAYMENT_STATUS_LABELS[payment.status] || payment.status }}
                            </span>
                          </td>
                          <td>
                            @if (payment.status !== 'PAID' && payment.status !== 'CANCELLED') {
                              <button class="btn-icon" title="Marquer comme payé" (click)="markAsPaid(payment.id)">
                                <i class="fa-solid fa-check"></i>
                              </button>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Payment Modal -->
            @if (showPaymentModal()) {
              <div class="modal-overlay" (click)="closePaymentModal()">
                <div class="modal" (click)="$event.stopPropagation()">
                  <div class="modal-header">
                    <h2><i class="fa-solid fa-plus"></i> Nouveau Paiement</h2>
                    <button class="close-btn" (click)="closePaymentModal()">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  <form [formGroup]="paymentForm" (ngSubmit)="onCreatePayment()" class="modal-body">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Montant (DH) *</label>
                        <input type="number" formControlName="amount" step="0.01" />
                      </div>
                      <div class="form-group">
                        <label>Méthode</label>
                        <select formControlName="method">
                          @for (method of paymentMethods; track method) {
                            <option [value]="method">{{ PAYMENT_METHOD_LABELS[method] }}</option>
                          }
                        </select>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Date de paiement</label>
                        <input type="date" formControlName="paymentDate" />
                      </div>
                      <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" formControlName="dueDate" />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Référence</label>
                        <input type="text" formControlName="reference" />
                      </div>
                      <div class="form-group">
                        <label>N° Facture</label>
                        <input type="text" formControlName="invoiceNumber" />
                      </div>
                    </div>
                    @if (missions().length > 0) {
                      <div class="form-group">
                        <label>Mission associée</label>
                        <select formControlName="missionId">
                          <option [ngValue]="null">-- Aucune --</option>
                          @for (mission of missions(); track mission.id) {
                            <option [ngValue]="mission.id">{{ mission.title }}</option>
                          }
                        </select>
                      </div>
                    }
                    <div class="form-group">
                      <label>Statut</label>
                      <select formControlName="status">
                        @for (status of paymentStatuses; track status) {
                          <option [value]="status">{{ PAYMENT_STATUS_LABELS[status] }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Notes</label>
                      <textarea formControlName="notes" rows="2"></textarea>
                    </div>
                    <div class="modal-actions">
                      <button type="button" class="btn btn-outline" (click)="closePaymentModal()">Annuler</button>
                      <button type="submit" class="btn btn-primary" [disabled]="paymentForm.invalid || isCreatingPayment()">
                        @if (isCreatingPayment()) {
                          <span class="spinner-sm"></span> Création...
                        } @else {
                          <i class="fa-solid fa-plus"></i> Ajouter
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .client-detail-page { max-width: 1200px; margin: 0 auto; }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary-color);
      text-decoration: none;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .back-link:hover { text-decoration: underline; }

    /* Header */
    .client-header {
      position: relative;
      margin-bottom: 2rem;
    }

    .header-bg {
      position: absolute;
      inset: 0;
      height: 120px;
      background: linear-gradient(135deg, var(--primary-color), #1e88e5);
      border-radius: 20px;
    }

    .header-content {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 1.5rem;
      padding: 2rem 2rem 1.5rem;
    }

    .client-avatar {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      border: 4px solid white;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .client-avatar.type-particulier { background: linear-gradient(135deg, #1565c0, #1e88e5); }
    .client-avatar.type-entreprise { background: linear-gradient(135deg, #7b1fa2, #9c27b0); }
    .client-avatar.type-municipalite { background: linear-gradient(135deg, #e65100, #f57c00); }
    .client-avatar.type-syndic { background: linear-gradient(135deg, #00695c, #00897b); }
    .client-avatar.type-collectivite { background: linear-gradient(135deg, #4527a0, #5e35b1); }
    .client-avatar.type-administration { background: linear-gradient(135deg, #283593, #3949ab); }
    .client-avatar.type-other { background: linear-gradient(135deg, #424242, #616161); }

    .client-info { flex: 1; min-width: 0; }

    .client-info h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
    }

    .type-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      background: rgba(255,255,255,0.2);
      color: white;
      text-transform: uppercase;
      margin-top: 0.25rem;
    }

    .header-meta {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.8);
    }

    .header-meta span {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .btn {
      padding: 0.7rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn-primary { background: var(--primary-color); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { background: white; border: 2px solid var(--border-color); color: var(--text-color); }
    .btn-outline:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.8rem; }

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
    .stat-icon.red { background: rgba(229,57,53,0.1); color: #e53935; }

    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-color); }
    .stat-label { font-size: 0.78rem; color: var(--text-light); }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.25rem;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 1.5rem;
    }

    .tab {
      padding: 0.875rem 1.5rem;
      border: none;
      background: none;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-light);
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.2s;
    }

    .tab:hover { color: var(--primary-color); }

    .tab.active {
      color: var(--primary-color);
    }

    .tab.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--primary-color);
      border-radius: 2px 2px 0 0;
    }

    .tab-badge {
      font-size: 0.65rem;
      background: var(--primary-color);
      color: white;
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
      font-weight: 700;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.25rem;
    }

    .info-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .info-card.full-width { grid-column: 1 / -1; }

    .info-card h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-color);
    }

    .info-card h3 i { color: var(--primary-color); }

    .info-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .info-icon {
      width: 36px;
      height: 36px;
      background: rgba(21,101,192,0.08);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .info-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .info-value {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .notes-text {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-light);
      white-space: pre-wrap;
    }

    /* Financial Summary */
    .finance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .finance-item {
      text-align: center;
      padding: 1.25rem;
      border-radius: 12px;
    }

    .finance-item.paid { background: rgba(76,175,80,0.08); }
    .finance-item.due { background: rgba(255,152,0,0.08); }
    .finance-item.balance.positive { background: rgba(76,175,80,0.08); }
    .finance-item.balance.negative { background: rgba(229,57,53,0.08); }

    .finance-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-light);
      margin-bottom: 0.25rem;
    }

    .finance-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .finance-item.paid .finance-value { color: #388e3c; }
    .finance-item.due .finance-value { color: #f57c00; }
    .finance-item.balance.positive .finance-value { color: #388e3c; }
    .finance-item.balance.negative .finance-value { color: #e53935; }

    /* Missions */
    .missions-list {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .mission-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      text-decoration: none;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s;
    }

    .mission-row:hover { background: rgba(21,101,192,0.03); }
    .mission-row:last-child { border-bottom: none; }

    .mission-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mission-status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .mission-status-dot.status-planned { background: #42a5f5; }
    .mission-status-dot.status-in_progress { background: #ff9800; }
    .mission-status-dot.status-completed { background: #4caf50; }
    .mission-status-dot.status-cancelled { background: #ef5350; }

    .mission-title {
      display: block;
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.9rem;
    }

    .mission-meta {
      display: block;
      font-size: 0.78rem;
      color: var(--text-light);
      margin-top: 0.15rem;
    }

    .mission-status-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .mission-status-badge.status-planned { background: rgba(66,165,245,0.1); color: #1e88e5; }
    .mission-status-badge.status-in_progress { background: rgba(255,152,0,0.1); color: #f57c00; }
    .mission-status-badge.status-completed { background: rgba(76,175,80,0.1); color: #388e3c; }
    .mission-status-badge.status-cancelled { background: rgba(239,83,80,0.1); color: #e53935; }

    /* Payments */
    .payments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .payments-header h3 {
      font-size: 1rem;
      font-weight: 600;
    }

    .payments-table-wrap {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      overflow: auto;
    }

    .payments-table {
      width: 100%;
      border-collapse: collapse;
    }

    .payments-table th {
      text-align: left;
      padding: 0.875rem 1rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-light);
      border-bottom: 2px solid var(--border-color);
      white-space: nowrap;
    }

    .payments-table td {
      padding: 0.875rem 1rem;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-color);
    }

    .payments-table tr:last-child td { border-bottom: none; }

    .amount { font-weight: 700; color: var(--text-color); }

    .payment-status {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .payment-paid { background: rgba(76,175,80,0.1); color: #388e3c; }
    .payment-pending { background: rgba(255,152,0,0.1); color: #f57c00; }
    .payment-partial { background: rgba(33,150,243,0.1); color: #1e88e5; }
    .payment-overdue { background: rgba(229,57,53,0.1); color: #e53935; }
    .payment-cancelled { background: rgba(158,158,158,0.1); color: #616161; }
    .payment-refunded { background: rgba(156,39,176,0.1); color: #7b1fa2; }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(76,175,80,0.1);
      color: #388e3c;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon:hover { background: #388e3c; color: white; }

    /* Edit Form */
    .edit-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .edit-card h2 {
      font-size: 1.15rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .form-group { margin-bottom: 1rem; }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.4rem;
      font-size: 0.85rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 0.9rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding-top: 1.5rem;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    /* Loading / Empty */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .error-icon { font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; }

    .tab-loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .empty-mini {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      color: var(--text-light);
      text-align: center;
    }

    .empty-mini i { font-size: 2rem; opacity: 0.3; margin-bottom: 0.75rem; }

    .spinner, .spinner-large {
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner { width: 32px; height: 32px; }
    .spinner-large { width: 48px; height: 48px; margin-bottom: 1rem; }

    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
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
      font-size: 1.15rem;
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

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1rem 2rem 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .header-content { flex-direction: column; align-items: flex-start; }
      .header-actions { width: 100%; }
      .info-grid { grid-template-columns: 1fr; }
      .finance-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);
  private readonly fb = inject(FormBuilder);

  client = signal<Client | null>(null);
  missions = signal<Mission[]>([]);
  payments = signal<Payment[]>([]);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  missionsLoading = signal(false);
  paymentsLoading = signal(false);
  showPaymentModal = signal(false);
  isCreatingPayment = signal(false);
  activeTab = signal<'info' | 'missions' | 'payments'>('info');

  clientTypes = Object.keys(CLIENT_TYPE_LABELS) as ClientType[];
  CLIENT_TYPE_LABELS = CLIENT_TYPE_LABELS;
  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_STATUS_LABELS = MISSION_STATUS_LABELS;
  PAYMENT_STATUS_LABELS = PAYMENT_STATUS_LABELS;
  PAYMENT_METHOD_LABELS = PAYMENT_METHOD_LABELS;
  paymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED'];
  paymentMethods: PaymentMethod[] = ['CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'OTHER'];

  editForm: FormGroup;
  paymentForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      type: ['PARTICULIER'],
      contactPerson: [''],
      phone: [''],
      email: [''],
      address: [''],
      city: [''],
      postalCode: [''],
      billingAddress: [''],
      siret: [''],
      vatNumber: [''],
      hasContract: [false],
      contractStartDate: [''],
      contractEndDate: [''],
      notes: ['']
    });

    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      method: ['CASH'],
      status: ['PENDING'],
      paymentDate: [new Date().toISOString().split('T')[0]],
      dueDate: [''],
      reference: [''],
      invoiceNumber: [''],
      missionId: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(+id);
    }
  }

  loadClient(id: number): void {
    this.isLoading.set(true);
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.populateEditForm(client);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  populateEditForm(client: Client): void {
    this.editForm.patchValue({
      name: client.name,
      type: client.type,
      contactPerson: client.contactPerson,
      phone: client.phone,
      email: client.email,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      billingAddress: client.billingAddress,
      siret: client.siret,
      vatNumber: client.vatNumber,
      hasContract: client.hasContract,
      contractStartDate: client.contractStartDate,
      contractEndDate: client.contractEndDate,
      notes: client.notes
    });
  }

  loadMissions(): void {
    if (this.missions().length > 0) return;
    const id = this.client()?.id;
    if (!id) return;
    this.missionsLoading.set(true);
    this.clientService.getClientMissions(id).subscribe({
      next: (missions) => {
        this.missions.set(missions);
        this.missionsLoading.set(false);
      },
      error: () => this.missionsLoading.set(false)
    });
  }

  loadPayments(): void {
    if (this.payments().length > 0) return;
    const id = this.client()?.id;
    if (!id) return;
    this.paymentsLoading.set(true);
    this.clientService.getClientPayments(id).subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.paymentsLoading.set(false);
      },
      error: () => this.paymentsLoading.set(false)
    });
  }

  onSave(): void {
    if (this.editForm.invalid) return;
    const id = this.client()?.id;
    if (!id) return;
    this.isSaving.set(true);

    this.clientService.updateClient(id, this.editForm.value).subscribe({
      next: (updated) => {
        this.client.set(updated);
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }

  toggleActive(): void {
    const c = this.client();
    if (!c) return;

    const action = c.active
      ? this.clientService.deactivateClient(c.id)
      : this.clientService.activateClient(c.id);

    action.subscribe({
      next: (updated) => this.client.set(updated)
    });
  }

  onCreatePayment(): void {
    if (this.paymentForm.invalid) return;
    const id = this.client()?.id;
    if (!id) return;
    this.isCreatingPayment.set(true);

    this.clientService.createPayment(id, this.paymentForm.value).subscribe({
      next: () => {
        this.closePaymentModal();
        this.payments.set([]);
        this.loadPayments();
        this.loadClient(id);
        this.isCreatingPayment.set(false);
      },
      error: () => this.isCreatingPayment.set(false)
    });
  }

  markAsPaid(paymentId: number): void {
    this.clientService.updatePaymentStatus(paymentId, 'PAID').subscribe({
      next: () => {
        const id = this.client()?.id;
        if (id) {
          this.payments.set([]);
          this.loadPayments();
          this.loadClient(id);
        }
      }
    });
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.paymentForm.reset({
      method: 'CASH',
      status: 'PENDING',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  }
}
