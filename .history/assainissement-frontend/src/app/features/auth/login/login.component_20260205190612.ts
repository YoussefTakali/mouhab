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
          <div class="left-decoration"></div>
          <div class="brand-content">
            <div class="brand-logo">
              <i class="fas fa-water"></i>
            </div>
            <h1 class="brand-title">AssainiPro</h1>
            <p class="brand-tagline">Votre partenaire digital</p>
            <p class="brand-subtitle">Plateforme de gestion complète pour les opérations d'assainissement</p>
            <div class="brand-features">
              <div class="feature-item">
                <i class="fas fa-tasks"></i>
                <span>Missions</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-users-cog"></i>
                <span>Équipes</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-analytics"></i>
                <span>Rapports</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-calendar-check"></i>
                <span>Planning</span>
              </div>
            </div>
          </div>
          <div class="brand-footer">
            <p>© 2026 AssainiPro</p>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="card-right">
          <div class="login-header">
            <div class="welcome-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <h2>Bienvenue</h2>
            <p>Connectez-vous à votre espace professionnel</p>
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
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 
        0 30px 60px rgba(0, 0, 0, 0.25),
        0 10px 20px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      z-index: 2;
      max-width: 920px;
      width: 92%;
      max-height: 88vh;
    }

    /* Left Side - Branding */
    .card-left {
      flex: 1;
      background: linear-gradient(160deg, #0d1b2a 0%, #1b263b 40%, #0d1b2a 100%);
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-width: 320px;
      position: relative;
      overflow: hidden;
    }

    .left-decoration {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(201, 25, 13, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .brand-content {
      position: relative;
      z-index: 2;
    }

    .brand-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #C9190D 0%, #e63946 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 
        0 10px 30px rgba(201, 25, 13, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: rotate(-5deg);
      transition: transform 0.3s ease;
    }

    .brand-logo:hover {
      transform: rotate(0deg) scale(1.05);
    }

    .brand-logo i {
      font-size: 2.2rem;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .brand-title {
      font-family: "Urbanist", sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .brand-tagline {
      font-family: "Poppins", sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      color: #C9190D;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0 0 1rem 0;
    }

    .brand-subtitle {
      font-family: "Poppins", sans-serif;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 2rem 0;
      line-height: 1.6;
      max-width: 280px;
    }

    .brand-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem;
      width: 100%;
      max-width: 280px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }

    .feature-item:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateX(3px);
    }

    .feature-item i {
      font-size: 0.95rem;
      color: #e63946;
      width: 18px;
      text-align: center;
    }

    .brand-footer {
      position: absolute;
      bottom: 1.5rem;
      left: 0;
      right: 0;
      text-align: center;
    }

    .brand-footer p {
      font-family: "Poppins", sans-serif;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      margin: 0;
    }

    /* Right Side - Form */
    .card-right {
      flex: 1.1;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 340px;
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .welcome-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      border: 3px solid white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .welcome-icon i {
      font-size: 1.8rem;
      color: #C9190D;
    }

    .login-header h2 {
      font-family: "Urbanist", sans-serif;
      font-size: 1.85rem;
      font-weight: 700;
      color: #0d1b2a;
      margin: 0 0 0.4rem 0;
      letter-spacing: -0.3px;
    }

    .login-header p {
      font-family: "Poppins", sans-serif;
      color: #6b7280;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.5;
    }

    /* Form Styles */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
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
      color: #374151;
      font-size: 0.88rem;
      font-family: "Poppins", sans-serif;
    }

    .form-label i {
      color: #C9190D;
      font-size: 0.85rem;
      width: 16px;
      text-align: center;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 0.95rem 2.8rem 0.95rem 1.1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.95rem;
      font-family: "Poppins", sans-serif;
      transition: all 0.25s ease;
      background: white;
      color: #0d1b2a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .form-input:focus {
      outline: none;
      border-color: #C9190D;
      background: white;
      box-shadow: 
        0 0 0 4px rgba(201, 25, 13, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .form-input.error {
      border-color: #C9190D;
      background: #fef2f2;
    }

    .form-input::placeholder {
      color: #9ca3af;
      font-weight: 400;
    }

    .password-toggle {
      position: absolute;
      right: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .password-toggle:hover {
      color: #C9190D;
      background: rgba(201, 25, 13, 0.05);
    }

    /* Error Messages */
    .error-message {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      padding: 0.85rem 1.1rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
      animation: shakeError 0.4s ease;
    }

    @keyframes shakeError {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }

    .form-error {
      color: #dc2626;
      font-size: 0.8rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    /* Login Button */
    .login-btn {
      background: linear-gradient(135deg, #C9190D 0%, #a71d2a 50%, #8B0000 100%);
      color: white;
      border: none;
      padding: 1rem 1.75rem;
      border-radius: 12px;
      font-size: 1.02rem;
      font-weight: 600;
      font-family: "Poppins", sans-serif;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 4px 15px rgba(201, 25, 13, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 0.75rem;
      letter-spacing: 0.2px;
      position: relative;
      overflow: hidden;
    }

    .login-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      transition: left 0.5s ease;
    }

    .login-btn:hover:not(:disabled)::before {
      left: 100%;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 25px rgba(201, 25, 13, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .login-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .login-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      box-shadow: none;
    }

    /* Demo Section */
    .demo-section {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }

    .demo-label {
      font-size: 0.78rem;
      color: #9ca3af;
      font-family: "Poppins", sans-serif;
      display: block;
      margin-bottom: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 500;
    }

    .demo-btns {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .demo-btns button {
      background: white;
      border: 1.5px solid #e5e7eb;
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-family: "Poppins", sans-serif;
      cursor: pointer;
      transition: all 0.25s ease;
      font-weight: 600;
      color: #374151;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .demo-btns button:hover {
      background: linear-gradient(135deg, #C9190D 0%, #a71d2a 100%);
      color: white;
      border-color: #C9190D;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(201, 25, 13, 0.25);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .split-card {
        flex-direction: column;
        max-height: none;
        height: auto;
        max-width: 420px;
      }

      .card-left {
        padding: 2rem 1.5rem;
        min-width: auto;
      }

      .brand-features {
        display: none;
      }

      .brand-subtitle {
        margin-bottom: 0;
      }

      .brand-footer {
        display: none;
      }

      .card-right {
        min-width: auto;
        padding: 2rem 1.5rem;
      }

      .welcome-icon {
        width: 50px;
        height: 50px;
      }

      .welcome-icon i {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .login-page {
        padding: 0.75rem;
      }

      .split-card {
        width: 100%;
        border-radius: 20px;
      }

      .card-left {
        padding: 1.5rem 1rem;
      }

      .brand-logo {
        width: 60px;
        height: 60px;
      }

      .brand-logo i {
        font-size: 1.6rem;
      }

      .brand-title {
        font-size: 1.6rem;
      }

      .brand-tagline {
        font-size: 0.7rem;
      }

      .brand-subtitle {
        display: none;
      }

      .card-right {
        padding: 1.5rem 1.25rem;
      }

      .login-header h2 {
        font-size: 1.5rem;
      }

      .demo-btns {
        flex-direction: column;
      }

      .demo-btns button {
        width: 100%;
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
