import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MissionService } from '../../../core/services/mission.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ClientService } from '../../../core/services/client.service';
import { Employee } from '../../../core/models/user.model';
import { Client, ClientType, CLIENT_TYPE_LABELS } from '../../../core/models/client.model';
import { Mission, MissionType, MissionPriority, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../../core/models/mission.model';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="mission-form-page">
      <div class="page-header">
        <a routerLink="/missions" class="back-link">← Retour aux missions</a>
        <h1>{{ isEditMode ? 'Modifier la Mission' : 'Nouvelle Mission' }}</h1>
      </div>

      <form [formGroup]="missionForm" (ngSubmit)="onSubmit()" class="form-card">
        <!-- Basic Info Section -->
        <section class="form-section">
          <h2><i class="fa-solid fa-clipboard-list"></i> Informations Générales</h2>
          
          <div class="form-group">
            <label for="title">Titre de la mission *</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title"
              placeholder="Ex: Curage réseau principal"
            />
            <span class="form-hint">Donnez un titre clair et descriptif</span>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              formControlName="description"
              rows="4"
              placeholder="Décrivez les détails de l'intervention..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="type">Type de mission *</label>
              <select id="type" formControlName="type">
                @for (type of types; track type) {
                  <option [value]="type">{{ MISSION_TYPE_LABELS[type] }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="priority">Priorité *</label>
              <select id="priority" formControlName="priority">
                @for (priority of priorities; track priority) {
                  <option [value]="priority">{{ MISSION_PRIORITY_LABELS[priority] }}</option>
                }
              </select>
            </div>
          </div>
        </section>

        <!-- Location Section -->
        <section class="form-section">
          <h2><i class="fa-solid fa-location-dot"></i> Localisation</h2>
          
          <div class="form-group">
            <label for="address">Adresse d'intervention *</label>
            <input 
              type="text" 
              id="address" 
              formControlName="address"
              placeholder="123 Rue de la Mission, 75001 Paris"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="latitude">Latitude</label>
              <input 
                type="number" 
                id="latitude" 
                formControlName="latitude"
                step="0.000001"
              />
            </div>

            <div class="form-group">
              <label for="longitude">Longitude</label>
              <input 
                type="number" 
                id="longitude" 
                formControlName="longitude"
                step="0.000001"
              />
            </div>
          </div>
        </section>

        <!-- Client Section -->
        <section class="form-section">
          <h2><i class="fa-solid fa-building"></i> Client</h2>

          <div class="client-mode-toggle">
            <button type="button" class="toggle-btn" [class.active]="clientMode() === 'select'" (click)="clientMode.set('select')">
              <i class="fa-solid fa-search"></i> Client existant
            </button>
            <button type="button" class="toggle-btn" [class.active]="clientMode() === 'new'" (click)="clientMode.set('new')">
              <i class="fa-solid fa-plus"></i> Nouveau client
            </button>
            <button type="button" class="toggle-btn" [class.active]="clientMode() === 'manual'" (click)="clientMode.set('manual')">
              <i class="fa-solid fa-pen"></i> Saisie libre
            </button>
          </div>

          @if (clientMode() === 'select') {
            <div class="client-search-wrapper">
              <div class="form-group">
                <label>Rechercher un client</label>
                <input
                  type="text"
                  placeholder="Tapez pour rechercher..."
                  [ngModel]="clientSearchQuery"
                  [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="onClientSearch($event)"
                />
              </div>
              @if (clientSearchResults().length > 0) {
                <div class="client-results">
                  @for (c of clientSearchResults(); track c.id) {
                    <div class="client-result-item" [class.selected]="selectedClient()?.id === c.id" (click)="selectClient(c)">
                      <div class="result-avatar" [class]="'type-' + c.type?.toLowerCase()">{{ c.name.charAt(0) }}</div>
                      <div class="result-info">
                        <span class="result-name">{{ c.name }}</span>
                        <span class="result-meta">
                          {{ CLIENT_TYPE_LABELS[c.type] || c.type }}
                          @if (c.phone) { &bull; {{ c.phone }} }
                          @if (c.city) { &bull; {{ c.city }} }
                        </span>
                      </div>
                      @if (selectedClient()?.id === c.id) {
                        <i class="fa-solid fa-circle-check selected-check"></i>
                      }
                    </div>
                  }
                </div>
              }
              @if (selectedClient()) {
                <div class="selected-client-banner">
                  <i class="fa-solid fa-user-check"></i>
                  <span>Client sélectionné: <strong>{{ selectedClient()!.name }}</strong></span>
                  <button type="button" class="clear-btn" (click)="clearSelectedClient()">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              }
            </div>
          }

          @if (clientMode() === 'new') {
            <div class="new-client-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Nom du client *</label>
                  <input type="text" formControlName="newClientName" placeholder="Nom du client" />
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <select formControlName="newClientType">
                    @for (type of clientTypeKeys; track type) {
                      <option [value]="type">{{ CLIENT_TYPE_LABELS[type] }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" formControlName="newClientPhone" placeholder="06 12 34 56 78" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" formControlName="newClientEmail" placeholder="email@exemple.com" />
                </div>
              </div>
              <div class="form-group">
                <label>Adresse</label>
                <input type="text" formControlName="newClientAddress" placeholder="Adresse du client" />
              </div>
              <span class="form-hint">Le client sera créé automatiquement lors de la soumission</span>
            </div>
          }

          @if (clientMode() === 'manual') {
            <div class="form-row">
              <div class="form-group">
                <label for="clientName">Nom du client</label>
                <input
                  type="text"
                  id="clientName"
                  formControlName="clientName"
                  placeholder="Entreprise XYZ"
                />
              </div>
              <div class="form-group">
                <label for="clientPhone">Téléphone</label>
                <input
                  type="tel"
                  id="clientPhone"
                  formControlName="clientPhone"
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>
          }
        </section>

        <!-- Schedule Section -->
        <section class="form-section">
          <h2><i class="fa-regular fa-calendar-days"></i> Planification</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="scheduledDate">Date et heure prévues *</label>
              <input 
                type="datetime-local" 
                id="scheduledDate" 
                formControlName="scheduledDate"
              />
            </div>

            <div class="form-group">
              <label for="estimatedDuration">Durée estimée (minutes)</label>
              <input 
                type="number" 
                id="estimatedDuration" 
                formControlName="estimatedDuration"
                min="15"
                step="15"
                placeholder="60"
              />
            </div>
          </div>

          <div class="form-group">
              <label for="assignedToId">Assigner à</label>
              <select id="assignedToId" formControlName="assignedToId">
              <option value="">Non assigné</option>
              @for (employee of employees(); track employee.id) {
                <option [value]="employee.id">{{ employee.user?.firstName || employee.firstName }} {{ employee.user?.lastName || employee.lastName }}</option>
              }
            </select>
            <span class="form-hint">Vous pouvez assigner la mission plus tard</span>
          </div>
        </section>

        <!-- Points Section -->
        <section class="form-section">
          <h2><i class="fa-solid fa-trophy"></i> Points</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="basePoints">Points de base</label>
              <input 
                type="number" 
                id="basePoints" 
                formControlName="basePoints"
                min="0"
                placeholder="50"
              />
              <span class="form-hint">Points attribués à la fin de la mission</span>
            </div>

            <div class="form-group">
              <label for="bonusPoints">Points bonus</label>
              <input 
                type="number" 
                id="bonusPoints" 
                formControlName="bonusPoints"
                min="0"
                placeholder="0"
              />
              <span class="form-hint">Points supplémentaires pour mission urgente</span>
            </div>
          </div>
        </section>

        <!-- Checklist Section -->
        <section class="form-section">
          <h2><i class="fa-solid fa-list-check"></i> Liste de Contrôle</h2>
          
          <div class="checklist-builder">
            <div class="checklist-items" formArrayName="checklist">
              @for (item of checklistArray.controls; track $index) {
                <div class="checklist-item" [formGroupName]="$index">
                  <input 
                    type="text" 
                    formControlName="description"
                    placeholder="Élément de la checklist"
                  />
                  <button type="button" class="remove-btn" (click)="removeChecklistItem($index)">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              }
            </div>
            <button type="button" class="btn btn-outline add-btn" (click)="addChecklistItem()">
              <i class="fa-solid fa-plus"></i> Ajouter un élément
            </button>
          </div>
        </section>

        <!-- Requirements Section -->
        <section class="form-section">
          <h2><i class="fa-solid fa-camera"></i> Exigences</h2>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="requiresBeforePhoto" />
              <span>Photo avant intervention obligatoire</span>
            </label>
            
            <label class="checkbox-label">
              <input type="checkbox" formControlName="requiresAfterPhoto" />
              <span>Photo après intervention obligatoire</span>
            </label>
            
            <label class="checkbox-label">
              <input type="checkbox" formControlName="requiresSignature" />
              <span>Signature du client obligatoire</span>
            </label>
          </div>
        </section>

        <!-- Form Actions -->
        <div class="form-actions">
          <a routerLink="/missions" class="btn btn-outline">Annuler</a>
          <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
            @if (isSubmitting()) {
              <span class="spinner"></span>
              Enregistrement...
            } @else {
              {{ isEditMode ? 'Mettre à jour' : 'Créer la mission' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .mission-form-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .back-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .page-header h1 {
      font-size: 1.75rem;
      color: var(--text-color);
    }

    .form-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h2 {
      font-size: 1.125rem;
      color: var(--text-color);
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color var(--transition-speed) ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-group textarea {
      resize: vertical;
    }

    .form-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }

    /* Checklist Builder */
    .checklist-builder {
      margin-top: 1rem;
    }

    .checklist-items {
      margin-bottom: 1rem;
    }

    .checklist-item {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .checklist-item input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
    }

    .checklist-item input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .remove-btn {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.5rem;
      opacity: 0.6;
      transition: opacity var(--transition-speed) ease;
    }

    .remove-btn:hover {
      opacity: 1;
    }

    .add-btn {
      width: 100%;
    }

    /* Checkbox Group */
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: var(--primary-color);
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1.5rem;
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .form-actions .btn {
      min-width: 150px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Client Selection */
    .client-mode-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .toggle-btn {
      padding: 0.6rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      background: white;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
      color: var(--text-light);
    }

    .toggle-btn.active {
      border-color: var(--primary-color);
      background: rgba(21,101,192,0.05);
      color: var(--primary-color);
    }

    .client-search-wrapper { position: relative; }

    .client-results {
      border: 2px solid var(--border-color);
      border-radius: 12px;
      max-height: 220px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .client-result-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid var(--border-color);
    }

    .client-result-item:last-child { border-bottom: none; }
    .client-result-item:hover { background: rgba(21,101,192,0.04); }
    .client-result-item.selected { background: rgba(21,101,192,0.08); }

    .result-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .result-avatar.type-particulier { background: linear-gradient(135deg, #1565c0, #1e88e5); }
    .result-avatar.type-entreprise { background: linear-gradient(135deg, #7b1fa2, #9c27b0); }
    .result-avatar.type-municipalite { background: linear-gradient(135deg, #e65100, #f57c00); }
    .result-avatar.type-syndic { background: linear-gradient(135deg, #00695c, #00897b); }
    .result-avatar.type-collectivite { background: linear-gradient(135deg, #4527a0, #5e35b1); }
    .result-avatar.type-administration { background: linear-gradient(135deg, #283593, #3949ab); }
    .result-avatar.type-other { background: linear-gradient(135deg, #424242, #616161); }

    .result-info { flex: 1; min-width: 0; }
    .result-name { display: block; font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
    .result-meta { display: block; font-size: 0.75rem; color: var(--text-light); }

    .selected-check { color: var(--primary-color); font-size: 1.1rem; }

    .selected-client-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: rgba(76,175,80,0.08);
      border-radius: 10px;
      color: #388e3c;
      font-size: 0.9rem;
    }

    .clear-btn {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-light);
      font-size: 1rem;
    }

    .clear-btn:hover { color: #e53935; }

    .new-client-form {
      background: rgba(21,101,192,0.03);
      border-radius: 12px;
      padding: 1.25rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions .btn {
        width: 100%;
      }

      .client-mode-toggle {
        flex-direction: column;
      }
    }
  `]
})
export class MissionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly missionService = inject(MissionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly clientService = inject(ClientService);

  missionForm: FormGroup;
  employees = signal<Employee[]>([]);
  isEditMode = false;
  isSubmitting = signal(false);
  missionId: number | null = null;

  // Client selection
  clientMode = signal<'select' | 'new' | 'manual'>('select');
  clientSearchQuery = '';
  clientSearchResults = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);
  clientTypeKeys = Object.keys(CLIENT_TYPE_LABELS) as ClientType[];
  CLIENT_TYPE_LABELS = CLIENT_TYPE_LABELS;

  types = Object.keys(MISSION_TYPE_LABELS) as MissionType[];
  priorities = Object.keys(MISSION_PRIORITY_LABELS) as MissionPriority[];
  MISSION_TYPE_LABELS = MISSION_TYPE_LABELS;
  MISSION_PRIORITY_LABELS = MISSION_PRIORITY_LABELS;

  constructor() {
    this.missionForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      type: ['CURAGE', [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
      address: ['', [Validators.required]],
      latitude: [null],
      longitude: [null],
      clientName: [''],
      clientPhone: [''],
      clientId: [null],
      newClientName: [''],
      newClientType: ['PARTICULIER'],
      newClientPhone: [''],
      newClientEmail: [''],
      newClientAddress: [''],
      scheduledDate: ['', [Validators.required]],
      estimatedDuration: [60],
      assignedToId: [''],
      basePoints: [50],
      bonusPoints: [0],
      requiresBeforePhoto: [true],
      requiresAfterPhoto: [true],
      requiresSignature: [false],
      checklist: this.fb.array([])
    });
  }

  get checklistArray(): FormArray {
    return this.missionForm.get('checklist') as FormArray;
  }

  ngOnInit(): void {
    this.loadEmployees();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.missionId = +id;
      this.loadMission(+id);
    }
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => this.employees.set(
        employees.filter(employee => employee.user?.role === 'WORKER')
      )
    });
  }

  loadMission(id: number): void {
    this.missionService.getMission(id).subscribe({
      next: (mission) => {
        this.missionForm.patchValue({
          title: mission.title,
          description: mission.description,
          type: mission.type,
          priority: mission.priority,
          address: mission.address,
          latitude: mission.latitude,
          longitude: mission.longitude,
          clientName: mission.clientName,
          scheduledDate: this.formatDateForInput(mission.scheduledStartTime || mission.scheduledDate),
          estimatedDuration: mission.estimatedDurationMinutes ?? mission.estimatedDuration,
          assignedToId: mission.assignedToId || '',
          basePoints: mission.basePoints,
          bonusPoints: mission.bonusPoints,
          requiresBeforePhoto: mission.requiresBeforePhoto,
          requiresAfterPhoto: mission.requiresAfterPhoto,
          requiresSignature: mission.requiresSignature
        });

        if (mission.checklist) {
          mission.checklist.forEach(item => {
            this.checklistArray.push(this.fb.group({
              description: [item.description]
            }));
          });
        }
      }
    });
  }

  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  addChecklistItem(): void {
    this.checklistArray.push(this.fb.group({
      description: ['']
    }));
  }

  removeChecklistItem(index: number): void {
    this.checklistArray.removeAt(index);
  }

  onClientSearch(query: string): void {
    this.clientSearchQuery = query;
    if (query.length < 2) {
      this.clientSearchResults.set([]);
      return;
    }
    this.clientService.searchClients(query).subscribe({
      next: (results) => this.clientSearchResults.set(results)
    });
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.missionForm.patchValue({
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone
    });
    if (client.address && !this.missionForm.get('address')?.value) {
      this.missionForm.patchValue({ address: client.address });
    }
  }

  clearSelectedClient(): void {
    this.selectedClient.set(null);
    this.missionForm.patchValue({ clientId: null, clientName: '', clientPhone: '' });
  }

  private submitMission(missionData: any): void {
    delete missionData.newClientName;
    delete missionData.newClientType;
    delete missionData.newClientPhone;
    delete missionData.newClientEmail;
    delete missionData.newClientAddress;

    this.missionService.createMission(missionData).subscribe({
      next: (mission) => {
        this.router.navigate(['/missions', mission.id]);
      },
      error: (err) => {
        console.error('Failed to save mission:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.missionForm.invalid) {
      this.missionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.missionForm.value;

    const missionData: any = {
      ...formValue,
      scheduledStartTime: new Date(formValue.scheduledDate).toISOString(),
      estimatedDurationMinutes: formValue.estimatedDuration,
      assignedToId: formValue.assignedToId ? +formValue.assignedToId : undefined,
      checklist: formValue.checklist.filter((c: any) => c.description.trim())
    };

    // Handle client selection mode
    if (this.clientMode() === 'select' && this.selectedClient()) {
      missionData.clientId = this.selectedClient()!.id;
      missionData.clientName = this.selectedClient()!.name;
      missionData.clientPhone = this.selectedClient()!.phone;
    } else if (this.clientMode() === 'new' && formValue.newClientName) {
      // Create client first, then create mission
      const newClient = {
        name: formValue.newClientName,
        type: formValue.newClientType,
        phone: formValue.newClientPhone,
        email: formValue.newClientEmail,
        address: formValue.newClientAddress
      };
      this.clientService.createClient(newClient).subscribe({
        next: (created) => {
          missionData.clientId = created.id;
          missionData.clientName = created.name;
          missionData.clientPhone = created.phone;
          this.submitMission(missionData);
        },
        error: (err) => {
          console.error('Failed to create client:', err);
          this.isSubmitting.set(false);
        }
      });
      return;
    }

    // Clean up temp fields
    delete missionData.newClientName;
    delete missionData.newClientType;
    delete missionData.newClientPhone;
    delete missionData.newClientEmail;
    delete missionData.newClientAddress;

    this.submitMission(missionData);
  }
}
