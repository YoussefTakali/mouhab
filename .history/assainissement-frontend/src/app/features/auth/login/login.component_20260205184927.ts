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
      <!-- Left Panel - Branding -->
      <div class="auth-left">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="logo-icon">🔧</span>
            <span class="logo-text">AssainiPro</span>
          </div>
          <h1 class="brand-title">Gestion des Opérations d'Assainissement</h1>
          <p class="brand-description">
            Plateforme professionnelle de gestion des missions, équipes et interventions 
            pour les entreprises d'assainissement.
          </p>
          <div class="brand-features">
            <div class="feature">
              <span class="feature-icon">📋</span>
              <span>Gestion des missions</span>
            </div>
            <div class="feature">
              <span class="feature-icon">👥</span>
              <span>Suivi des équipes</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Tableau de bord</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📅</span>
              <span>Planification</span>
            </div>
          </div>
        </div>
        <div class="brand-footer">
          <p>© 2026 AssainiPro. Tous droits réservés.</p>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Connexion</h2>
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

            <button type="submit" class="btn-submit" [disabled]="isLoading()">
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
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      flex-direction: row;
    }

    /* Left Panel - Branding */
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #8b1538 0%, #c9190d 50%, #a71617 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }

    .auth-left::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 0.3; }
    }

    .brand-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 450px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .logo-icon {
      font-size: 3rem;
    }

    .logo-text {
      font-family: "Urbanist", "Poppins", sans-serif;
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      letter-spacing: 1px;
    }

    .brand-title {
      font-family: "Urbanist", "Poppins", sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: white;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .brand-description {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }

    .brand-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }

    .feature:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .feature-icon {
      font-size: 1.25rem;
    }

    .brand-footer {
      position: absolute;
      bottom: 2rem;
      z-index: 1;
    }

    .brand-footer p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }

    /* Right Panel - Form */
    .auth-right {
      flex: 1;
      background: #f5f6fa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h2 {
      font-family: "Urbanist", "Poppins", sans-serif;
      font-size: 1.75rem;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .auth-header p {
      color: #666;
      font-size: 0.95rem;
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
      color: #1a1a2e;
      font-size: 0.9rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s ease;
      background: #fafafa;
    }

    .form-group input:focus {
      outline: none;
      border-color: #a71617;
      background: white;
      box-shadow: 0 0 0 4px rgba(167, 22, 23, 0.1);
    }

    .form-group input.error {
      border-color: #dc3545;
    }

    .form-group input::placeholder {
      color: #999;
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
      transition: opacity 0.2s ease;
    }

    .password-toggle:hover {
      opacity: 1;
    }

    .form-error {
      color: #dc3545;
      font-size: 0.85rem;
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
      color: #1a1a2e;
      font-size: 0.9rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #a71617;
    }

    .forgot-link {
      color: #a71617;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .forgot-link:hover {
      color: #8b1538;
      text-decoration: underline;
    }

    .form-error-message {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      padding: 0.875rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }

    .btn-submit {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #a71617 0%, #c9190d 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(167, 22, 23, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(167, 22, 23, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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
      border-top: 1px solid #eee;
    }

    .auth-footer p {
      color: #666;
      font-size: 0.9rem;
    }

    .auth-footer a {
      color: #a71617;
      font-weight: 600;
      text-decoration: none;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    .demo-accounts {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px dashed #e0e0e0;
    }

    .demo-accounts h4 {
      text-align: center;
      color: #888;
      font-size: 0.85rem;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .demo-btn {
      padding: 0.6rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 10px;
      color: #1a1a2e;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .demo-btn:hover {
      background: linear-gradient(135deg, #a71617 0%, #c9190d 100%);
      color: white;
      border-color: #a71617;
      transform: translateY(-1px);
    }

    /* Responsive - Stack on mobile */
    @media (max-width: 992px) {
      .auth-container {
        flex-direction: column;
      }

      .auth-left {
        padding: 2rem;
        min-height: 40vh;
      }

      .brand-title {
        font-size: 1.5rem;
      }

      .brand-description {
        display: none;
      }

      .brand-features {
        display: none;
      }

      .brand-footer {
        display: none;
      }

      .auth-right {
        flex: none;
      }
    }

    @media (max-width: 480px) {
      .auth-left {
        padding: 1.5rem;
        min-height: 30vh;
      }

      .logo-text {
        font-size: 1.75rem;
      }

      .brand-title {
        font-size: 1.25rem;
      }

      .auth-right {
        padding: 1rem;
      }

      .auth-card {
        padding: 1.5rem;
      }

      .form-options {
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
      error: (error: { status: number }) => {
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
