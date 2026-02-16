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
    <!-- Full Page Red Background -->
    <div class="login-page">
      <!-- Animated Shapes on Background -->
      <div class="animated-bg">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>

      <!-- Centered Split Card -->
      <div class="split-card">
        <!-- Left Side - Branding -->
        <div class="card-left">
          <div class="brand-logo">
            <i class="fas fa-wrench"></i>
          </div>
          <h1 class="brand-title">AssainiPro</h1>
          <p class="brand-subtitle">Gestion des Opérations d'Assainissement</p>
          <div class="brand-features">
            <div class="feature-item">
              <i class="fas fa-clipboard-list"></i>
              <span>Missions</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>Équipes</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <span>Rapports</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-calendar-alt"></i>
              <span>Planning</span>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="card-right">
          <div class="login-header">
            <h2>Connexion</h2>
            <p>Bienvenue! Connectez-vous.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="error-message" *ngIf="errorMessage()">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage() }}
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fas fa-envelope"></i> Email
              </label>
              <div class="input-wrapper">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="votre&#64;email.fr"
                />
              </div>
              <div class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">Email requis</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Format invalide</span>
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">
                <i class="fas fa-lock"></i> Mot de passe
              </label>
              <div class="input-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="form-input"
                  [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Mot de passe"
                />
                <button type="button" class="password-toggle" (click)="togglePassword()" tabindex="-1">
                  <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Mot de passe requis</span>
              </div>
            </div>

            <button type="submit" class="login-btn" [disabled]="isLoading() || loginForm.invalid">
              <span *ngIf="!isLoading()"><i class="fas fa-sign-in-alt"></i> Se connecter</span>
              <span *ngIf="isLoading()"><i class="fas fa-spinner fa-spin"></i> Connexion...</span>
            </button>
          </form>

          <div class="demo-section">
            <span class="demo-label">Démo:</span>
            <div class="demo-btns">
              <button type="button" (click)="loginAsDemo('admin@assainissement.fr', 'admin123')">Admin</button>
              <button type="button" (click)="loginAsDemo('supervisor@assainissement.fr', 'super123')">Superviseur</button>
              <button type="button" (click)="loginAsDemo('worker1@assainissement.fr', 'worker123')">Technicien</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ==================== FULL PAGE RED BG WITH CENTERED SPLIT CARD ==================== */

    .login-page {
      height: 100vh;
      width: 100vw;
      background: linear-gradient(135deg, #041b2a 0%, #C9190D 50%, #8B0000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    /* Animated Background Shapes */
    .animated-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 50%;
      animation: float 10s ease-in-out infinite;
    }

    .shape-1 { width: 100px; height: 100px; top: 10%; left: 5%; animation-delay: 0s; }
    .shape-2 { width: 150px; height: 150px; bottom: 15%; right: 8%; animation-delay: 2s; }
    .shape-3 { width: 80px; height: 80px; top: 50%; left: 80%; animation-delay: 4s; }
    .shape-4 { width: 60px; height: 60px; bottom: 30%; left: 15%; animation-delay: 6s; }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
      50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
    }

    /* Centered Split Card */
    .split-card {
      display: flex;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
      z-index: 2;
      max-width: 900px;
      width: 90%;
      max-height: 90vh;
    }

    /* Left Side - Branding */
    .card-left {
      flex: 1;
      background: linear-gradient(135deg, #041b2a 0%, #0a2d42 100%);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-width: 280px;
    }

    .brand-logo {
      width: 70px;
      height: 70px;
      background: rgba(201, 25, 13, 0.9);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .brand-logo i {
      font-size: 2rem;
      color: white;
    }

    .brand-title {
      font-family: "Urbanist", sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.5rem 0;
    }

    .brand-subtitle {
      font-family: "Poppins", sans-serif;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.75);
      margin: 0 0 1.5rem 0;
      line-height: 1.4;
    }

    .brand-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      width: 100%;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .feature-item i {
      font-size: 0.85rem;
      color: #C9190D;
    }

    /* Right Side - Form */
    .card-right {
      flex: 1;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 320px;
      background: #fff;
    }

    .login-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .login-header h2 {
      font-family: "Urbanist", sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #041b2a;
      margin: 0 0 0.25rem 0;
    }

    .login-header p {
      font-family: "Poppins", sans-serif;
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Form Styles */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      color: #041b2a;
      font-size: 0.85rem;
      font-family: "Poppins", sans-serif;
    }

    .form-label i {
      color: #C9190D;
      font-size: 0.8rem;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 0.85rem 2.5rem 0.85rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 0.95rem;
      font-family: "Poppins", sans-serif;
      transition: all 0.3s ease;
      background: #fafafa;
      color: #041b2a;
    }

    .form-input:focus {
      outline: none;
      border-color: #C9190D;
      background: white;
      box-shadow: 0 0 0 3px rgba(201, 25, 13, 0.1);
    }

    .form-input.error {
      border-color: #C9190D;
    }

    .form-input::placeholder {
      color: #aaa;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 0.3rem;
    }

    .password-toggle:hover {
      color: #C9190D;
    }

    /* Error Messages */
    .error-message {
      background: #C9190D;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .form-error {
      color: #C9190D;
      font-size: 0.8rem;
      font-weight: 500;
    }

    /* Login Button */
    .login-btn {
      background: linear-gradient(135deg, #C9190D 0%, #8B0000 100%);
      color: white;
      border: none;
      padding: 0.9rem 1.5rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      font-family: "Poppins", sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(201, 25, 13, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(201, 25, 13, 0.4);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Demo Section */
    .demo-section {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px dashed #e0e0e0;
      text-align: center;
    }

    .demo-label {
      font-size: 0.8rem;
      color: #888;
      font-family: "Poppins", sans-serif;
      display: block;
      margin-bottom: 0.5rem;
    }

    .demo-btns {
      display: flex;
      gap: 0.4rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .demo-btns button {
      background: #f0f0f0;
      border: 1px solid #ddd;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-family: "Poppins", sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .demo-btns button:hover {
      background: #C9190D;
      color: white;
      border-color: #C9190D;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .split-card {
        flex-direction: column;
        max-height: none;
        height: auto;
      }

      .card-left {
        padding: 1.5rem;
        min-width: auto;
      }

      .brand-features {
        display: none;
      }

      .card-right {
        min-width: auto;
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .login-page {
        padding: 1rem;
      }

      .split-card {
        width: 100%;
      }

      .card-left {
        padding: 1rem;
      }

      .brand-title {
        font-size: 1.5rem;
      }

      .brand-subtitle {
        font-size: 0.8rem;
        display: none;
      }

      .card-right {
        padding: 1.25rem;
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
