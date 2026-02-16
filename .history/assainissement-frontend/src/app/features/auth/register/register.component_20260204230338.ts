import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">🔧</span>
            <span class="logo-text">AssainiPro</span>
          </div>
          <h1>Créer un compte</h1>
          <p>Rejoignez AssainiPro dès aujourd'hui.</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName"
                placeholder="Jean"
                [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
              />
              <div class="form-error" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                Le prénom est requis
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Nom</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName"
                placeholder="Dupont"
                [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
              />
              <div class="form-error" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                Le nom est requis
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="jean.dupont@email.fr"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              @if (registerForm.get('email')?.errors?.['required']) {
                L'email est requis
              } @else if (registerForm.get('email')?.errors?.['email']) {
                Format d'email invalide
              }
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input 
              type="tel" 
              id="phone" 
              formControlName="phone"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="password-input-wrapper">
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                id="password" 
                formControlName="password"
                placeholder="••••••••"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              <button type="button" class="password-toggle" (click)="togglePassword()">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="form-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              @if (registerForm.get('password')?.errors?.['required']) {
                Le mot de passe est requis
              } @else if (registerForm.get('password')?.errors?.['minlength']) {
                Au moins 6 caractères requis
              }
            </div>
            <div class="password-strength" *ngIf="registerForm.get('password')?.value">
              <div class="strength-bar" [class]="getPasswordStrength().class">
                <div class="strength-fill" [style.width]="getPasswordStrength().percent + '%'"></div>
              </div>
              <span class="strength-text">{{ getPasswordStrength().text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword"
              placeholder="••••••••"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.errors?.['passwordMismatch']">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="acceptTerms" />
              <span>J'accepte les <a href="#">conditions d'utilisation</a> et la <a href="#">politique de confidentialité</a></span>
            </label>
            <div class="form-error" *ngIf="registerForm.get('acceptTerms')?.invalid && registerForm.get('acceptTerms')?.touched">
              Vous devez accepter les conditions
            </div>
          </div>

          <div class="form-error-message" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
              Création en cours...
            } @else {
              Créer mon compte
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà inscrit? <a routerLink="/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .logo-icon {
      font-size: 2.5rem;
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .auth-header h1 {
      font-size: 1.75rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: var(--text-light);
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
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

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="tel"],
    .form-group input[type="password"] {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1rem;
      transition: all var(--transition-speed) ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
    }

    .form-group input.error {
      border-color: var(--danger-color);
    }

    .password-input-wrapper {
      position: relative;
    }

    .password-input-wrapper input {
      padding-right: 3rem;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      opacity: 0.6;
      transition: opacity var(--transition-speed) ease;
    }

    .password-toggle:hover {
      opacity: 1;
    }

    .password-strength {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .strength-bar.weak .strength-fill {
      background: var(--danger-color);
    }

    .strength-bar.medium .strength-fill {
      background: var(--warning-color);
    }

    .strength-bar.strong .strength-fill {
      background: var(--success-color);
    }

    .strength-text {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .form-error {
      color: var(--danger-color);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      accent-color: var(--primary-color);
    }

    .checkbox-label a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .checkbox-label a:hover {
      text-decoration: underline;
    }

    .form-error-message {
      background: rgba(220, 53, 69, 0.1);
      color: var(--danger-color);
      padding: 0.875rem;
      border-radius: 10px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .btn-block {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .auth-footer p {
      color: var(--text-light);
    }

    .auth-footer a {
      color: var(--primary-color);
      font-weight: 500;
      text-decoration: none;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  getPasswordStrength(): { class: string; percent: number; text: string } {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { class: 'weak', percent: 33, text: 'Faible' };
    } else if (strength <= 4) {
      return { class: 'medium', percent: 66, text: 'Moyen' };
    } else {
      return { class: 'strong', percent: 100, text: 'Fort' };
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { firstName, lastName, email, phone, password } = this.registerForm.value;
    
    this.authService.register({ firstName, lastName, email, phone, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error: { status: number }) => {
        this.isLoading.set(false);
        if (error.status === 400) {
          this.errorMessage.set('Cet email est déjà utilisé');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }
}
