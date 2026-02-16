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
    <!-- Split Login Container -->
    <div class="login-container">
      <!-- Left Panel - Branding -->
      <div class="left-panel">
        <div class="animated-bg">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="brand-content">
          <div class="brand-logo">
            <i class="fas fa-wrench"></i>
          </div>
          <h1 class="brand-title">AssainiPro</h1>
          <p class="brand-subtitle">Plateforme de Gestion des Opérations d'Assainissement</p>
          <div class="brand-features">
            <div class="feature-item">
              <i class="fas fa-clipboard-list"></i>
              <span>Gestion des Missions</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>Suivi des Équipes</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <span>Tableau de Bord</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-calendar-alt"></i>
              <span>Planification</span>
            </div>
          </div>
        </div>
        <div class="brand-footer">
          <p>&copy; 2026 AssainiPro. Tous droits réservés.</p>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="right-panel">
        <div class="login-card">
          <div class="login-header">
            <h2>Connexion</h2>
            <p>Bienvenue! Connectez-vous à votre compte.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Error Message -->
            <div class="error-message" *ngIf="errorMessage()">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage() }}
            </div>

            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fas fa-envelope"></i>
                Adresse Email
              </label>
              <div class="input-wrapper">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="votre&#64;email.fr"
                  autocomplete="email"
                />
                <div class="input-icon">
                  <i class="fas fa-at"></i>
                </div>
              </div>
              <div class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">L'email est requis</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Format d'email invalide</span>
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password" class="form-label">
                <i class="fas fa-lock"></i>
                Mot de passe
              </label>
              <div class="input-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="form-input"
                  [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Entrez votre mot de passe"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="togglePassword()"
                  tabindex="-1"
                >
                  <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Le mot de passe est requis</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="login-btn"
              [disabled]="isLoading() || loginForm.invalid"
              [class.loading]="isLoading()"
            >
              <span *ngIf="!isLoading()">
                <i class="fas fa-sign-in-alt"></i>
                Se connecter
              </span>
              <span *ngIf="isLoading()" class="loading-content">
                <i class="fas fa-spinner fa-spin"></i>
                Connexion en cours...
              </span>
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <p class="help-text">
              <i class="fas fa-info-circle"></i>
              Utilisez vos identifiants pour vous connecter
            </p>
          </div>

          <!-- Test Credentials -->
          <div class="test-credentials">
            <h4>Comptes de démonstration</h4>
            <div class="credential-grid">
              <div class="credential-item" (click)="loginAsDemo('admin@assainissement.fr', 'admin123')">
                <strong>Admin</strong>
              </div>
              <div class="credential-item" (click)="loginAsDemo('supervisor@assainissement.fr', 'super123')">
                <strong>Superviseur</strong>
              </div>
              <div class="credential-item" (click)="loginAsDemo('worker1@assainissement.fr', 'worker123')">
                <strong>Technicien</strong>
              </div>
              <div class="credential-item" (click)="loginAsDemo('hr@assainissement.fr', 'hr123456')">
                <strong>RH</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ==================== SPLIT LOGIN LAYOUT ==================== */

    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: row;
    }

    /* Left Panel - Branding */
    .left-panel {
      flex: 1;
      background: linear-gradient(135deg, #041b2a 0%, #C9190D 50%, #8B0000 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }

    .animated-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
    }

    .shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      animation: float 8s ease-in-out infinite;
    }

    .shape-1 {
      width: 120px;
      height: 120px;
      top: 15%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 180px;
      height: 180px;
      bottom: 20%;
      right: 10%;
      animation-delay: 3s;
    }

    .shape-3 {
      width: 80px;
      height: 80px;
      top: 60%;
      left: 60%;
      animation-delay: 6s;
    }

    @keyframes float {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg);
        opacity: 0.5;
      }
      50% { 
        transform: translateY(-30px) rotate(180deg);
        opacity: 0.8;
      }
    }

    .brand-content {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 400px;
    }

    .brand-logo {
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .brand-logo i {
      font-size: 3rem;
      color: white;
    }

    .brand-title {
      font-family: "Urbanist", sans-serif;
      font-size: 3rem;
      font-weight: 800;
      color: white;
      margin: 0 0 1rem 0;
      letter-spacing: 1px;
    }

    .brand-subtitle {
      font-family: "Poppins", sans-serif;
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 3rem 0;
      line-height: 1.6;
    }

    .brand-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.12);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .feature-item:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-3px);
    }

    .feature-item i {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .brand-footer {
      position: absolute;
      bottom: 2rem;
      z-index: 2;
    }

    .brand-footer p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      margin: 0;
    }

    /* Right Panel - Form */
    .right-panel {
      flex: 1;
      background: #f5f6fa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      background: white;
      border-radius: 24px;
      padding: 3rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h2 {
      font-family: "Urbanist", sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #041b2a;
      margin: 0 0 0.5rem 0;
    }

    .login-header p {
      font-family: "Poppins", sans-serif;
      color: #666;
      font-size: 0.95rem;
      margin: 0;
    }

    /* Form Styles */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #041b2a;
      font-size: 0.9rem;
      font-family: "Poppins", sans-serif;
    }

    .form-label i {
      color: #C9190D;
      font-size: 0.85rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      width: 100%;
      padding: 1rem 3rem 1rem 1rem;
      border: 2px solid #e8ecef;
      border-radius: 12px;
      font-size: 1rem;
      font-family: "Poppins", sans-serif;
      transition: all 0.3s ease;
      background: #fafafa;
      color: #041b2a;
    }

    .form-input:focus {
      outline: none;
      border-color: #C9190D;
      background: white;
      box-shadow: 0 0 0 4px rgba(201, 25, 13, 0.1);
    }

    .form-input.error {
      border-color: #C9190D;
      background: rgba(201, 25, 13, 0.03);
    }

    .form-input::placeholder {
      color: #999;
    }

    .input-icon {
      position: absolute;
      right: 1rem;
      color: #C9190D;
      opacity: 0.6;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .password-toggle:hover {
      color: #C9190D;
      background: rgba(201, 25, 13, 0.05);
    }

    /* Error Messages */
    .error-message {
      background: linear-gradient(135deg, #C9190D, #8B0000);
      color: white;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    .form-error {
      color: #C9190D;
      font-size: 0.85rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    /* Login Button */
    .login-btn {
      background: linear-gradient(135deg, #C9190D 0%, #8B0000 100%);
      color: white;
      border: none;
      padding: 1.1rem 2rem;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 600;
      font-family: "Poppins", sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(201, 25, 13, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 0.5rem;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(201, 25, 13, 0.4);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-btn.loading {
      background: linear-gradient(135deg, #666 0%, #444 100%);
    }

    .loading-content {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* Footer */
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .help-text {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: "Poppins", sans-serif;
    }

    .help-text i {
      color: #C9190D;
    }

    /* Test Credentials */
    .test-credentials {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px dashed #e0e0e0;
    }

    .test-credentials h4 {
      color: #666;
      margin: 0 0 1rem 0;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 500;
      font-family: "Poppins", sans-serif;
    }

    .credential-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .credential-item {
      background: #f5f6fa;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e0e0e0;
      text-align: center;
      font-family: "Poppins", sans-serif;
    }

    .credential-item:hover {
      background: linear-gradient(135deg, #C9190D, #8B0000);
      color: white;
      border-color: #C9190D;
      transform: translateY(-2px);
    }

    .credential-item strong {
      font-weight: 600;
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 992px) {
      .login-container {
        flex-direction: column;
      }

      .left-panel {
        padding: 2rem;
        min-height: 40vh;
      }

      .brand-title {
        font-size: 2.5rem;
      }

      .brand-subtitle {
        margin-bottom: 2rem;
      }

      .brand-features {
        display: none;
      }

      .brand-footer {
        display: none;
      }

      .right-panel {
        flex: none;
        min-height: 60vh;
      }
    }

    @media (max-width: 480px) {
      .left-panel {
        padding: 1.5rem;
        min-height: 30vh;
      }

      .brand-logo {
        width: 70px;
        height: 70px;
        margin-bottom: 1rem;
      }

      .brand-logo i {
        font-size: 2rem;
      }

      .brand-title {
        font-size: 2rem;
      }

      .brand-subtitle {
        font-size: 0.95rem;
        display: none;
      }

      .right-panel {
        padding: 1rem;
      }

      .login-card {
        padding: 2rem;
      }

      .credential-grid {
        grid-template-columns: 1fr;
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
