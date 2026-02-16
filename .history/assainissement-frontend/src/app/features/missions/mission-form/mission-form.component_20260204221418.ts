import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MissionService } from '../../core/services/mission.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/user.model';
import { Mission, MissionType, MissionPriority, MISSION_TYPE_LABELS, MISSION_PRIORITY_LABELS } from '../../core/models/mission.model';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mission-form-page">
      <div class="page-header">
        <a routerLink="/missions" class="back-link">← Retour aux missions</a>
        <h1>{{ isEditMode ? 'Modifier la Mission' : 'Nouvelle Mission' }}</h1>
      </div>

      <form [formGroup]="missionForm" (ngSubmit)="onSubmit()" class="form-card">
        <!-- Basic Info Section -->
        <section class="form-section">
          <h2>📋 Informations Générales</h2>
          
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
          <h2>📍 Localisation</h2>
          
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
          <h2>🏢 Client</h2>
          
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
        </section>

        <!-- Schedule Section -->
        <section class="form-section">
          <h2>📅 Planification</h2>
          
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
            <label for="assignedEmployeeId">Assigner à</label>
            <select id="assignedEmployeeId" formControlName="assignedEmployeeId">
              <option value="">Non assigné</option>
              @for (employee of employees(); track employee.id) {
                <option [value]="employee.id">{{ employee.firstName }} {{ employee.lastName }}</option>
              }
            </select>
            <span class="form-hint">Vous pouvez assigner la mission plus tard</span>
          </div>
        </section>

        <!-- Points Section -->
        <section class="form-section">
          <h2>🏆 Points</h2>
          
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
          <h2>✅ Liste de Contrôle</h2>
          
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
                    ❌
                  </button>
                </div>
              }
            </div>
            <button type="button" class="btn btn-outline add-btn" (click)="addChecklistItem()">
              ➕ Ajouter un élément
            </button>
          </div>
        </section>

        <!-- Requirements Section -->
        <section class="form-section">
          <h2>📸 Exigences</h2>
          
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
    }
  `]
})
export class MissionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private missionService = inject(MissionService);
  private employeeService = inject(EmployeeService);

  missionForm: FormGroup;
  employees = signal<Employee[]>([]);
  isEditMode = false;
  isSubmitting = signal(false);
  missionId: number | null = null;

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
      scheduledDate: ['', [Validators.required]],
      estimatedDuration: [60],
      assignedEmployeeId: [''],
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
      next: (employees) => this.employees.set(employees)
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
          scheduledDate: this.formatDateForInput(mission.scheduledDate),
          estimatedDuration: mission.estimatedDuration,
          assignedEmployeeId: mission.assignedEmployeeId || '',
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

  formatDateForInput(date: Date | string): string {
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

  onSubmit(): void {
    if (this.missionForm.invalid) {
      this.missionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.missionForm.value;

    const missionData: Partial<Mission> = {
      ...formValue,
      scheduledDate: new Date(formValue.scheduledDate),
      assignedEmployeeId: formValue.assignedEmployeeId ? +formValue.assignedEmployeeId : undefined,
      checklist: formValue.checklist.filter((c: any) => c.description.trim())
    };

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
}
