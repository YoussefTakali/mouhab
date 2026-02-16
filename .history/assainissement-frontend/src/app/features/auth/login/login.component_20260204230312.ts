import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
          <h1>Connexion</h1>
          <p>Bienvenue! Connectez-vous à votre compte.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="votre@email.fr"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              @if (loginForm.get('email')?.errors?.['required']) {
                L'email est requis
              } @else if (loginForm.get('email')?.errors?.['email']) {
                Format d'email invalide
              }
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="password-input-wrapper">
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                id="password" 
                formControlName="password"
                placeholder="••••••••"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
              <button type="button" class="password-toggle" (click)="togglePassword()">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Le mot de passe est requis
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" class="forgot-link">Mot de passe oublié?</a>
          </div>

          <div class="form-error-message" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Pas encore de compte? <a routerLink="/register">S'inscrire</a></p>
        </div>

        <div class="demo-accounts">
          <h4>Comptes de démonstration</h4>
          <div class="demo-grid">
            <button class="demo-btn" (click)="loginAsDemo('admin@assainissement.fr', 'admin123')">
              Admin
            </button>
            <button class="demo-btn" (click)="loginAsDemo('supervisor@assainissement.fr', 'super123')">
              Superviseur
            </button>
            <button class="demo-btn" (click)="loginAsDemo('worker1@assainissement.fr', 'worker123')">
              Technicien
            </button>
            <button class="demo-btn" (click)="loginAsDemo('hr@assainissement.fr', 'hr123456')">
              RH
            </button>
          </div>
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
      max-width: 440px;
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

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .form-group input {
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

    .form-error {
      color: var(--danger-color);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: var(--text-color);
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
    }

    .forgot-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-link:hover {
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

    .demo-accounts {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px dashed var(--border-color);
    }

    .demo-accounts h4 {
      text-align: center;
      color: var(--text-light);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .demo-btn {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      border-radius: 8px;
      color: var(--text-color);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all var(--transition-speed) ease;
    }

    .demo-btn:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;
    
    this.authService.login({ email, password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401) {
          this.errorMessage.set('Email ou mot de passe incorrect');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }

  loginAsDemo(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    this.onSubmit();
  }
}
