import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
      <!-- Hamburger Menu Button -->
      <button class="hamburger-btn" (click)="toggleSidebar()" [class.active]="isSidebarVisible()">
        <svg viewBox="0 0 100 100" width="40" height="40">
          <path class="line top"
                d="M 20,30 H 80"
                [class.active]="isSidebarVisible()" />
          <path class="line middle"
                d="M 20,50 H 80"
                [class.active]="isSidebarVisible()" />
          <path class="line bottom"
                d="M 20,70 H 80"
                [class.active]="isSidebarVisible()" />
        </svg>
      </button>

      <!-- Logo/Brand -->
      <div class="brand">
        <span class="brand-icon">🔧</span>
        <span class="brand-text">AssainiPro</span>
      </div>

      <!-- Right Side Actions -->
      <div class="navbar-right">
        <!-- Notifications -->
        <button class="notification-btn" title="Notifications">
          <span class="notification-icon">🔔</span>
          <span class="notification-badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
        </button>

        <!-- User Menu -->
        <div class="user-menu">
          <button class="user-menu-btn" (click)="toggleUserMenu($event)">
            <div class="user-avatar">
              {{ currentUser()?.firstName?.charAt(0) }}{{ currentUser()?.lastName?.charAt(0) }}
            </div>
            <span class="user-name">{{ currentUser()?.firstName }}</span>
            <svg class="dropdown-arrow" [class.open]="isUserMenuOpen()" viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </button>

          <div class="dropdown-menu" *ngIf="isUserMenuOpen()">
            <div class="dropdown-header">
              <div class="dropdown-user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</div>
              <div class="dropdown-user-role">{{ getRoleLabel(currentUser()?.role) }}</div>
            </div>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" (click)="navigateTo('/profile')">
              <span class="dropdown-icon">👤</span>
              Mon Profil
            </a>
            <a class="dropdown-item" (click)="navigateTo('/settings')">
              <span class="dropdown-icon">⚙️</span>
              Paramètres
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item danger" (click)="logout()">
              <span class="dropdown-icon">🚪</span>
              Déconnexion
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: linear-gradient(135deg, #8b1538 0%, #c9190d 50%, #a71617 100%);
      display: flex;
      align-items: center;
      padding: 0 1rem;
      z-index: 1001;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    /* Animated Hamburger Button */
    .hamburger-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-right: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hamburger-btn svg {
      transition: transform 0.3s ease;
    }

    .hamburger-btn:hover svg {
      transform: scale(1.1);
    }

    .line {
      fill: none;
      stroke: white;
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease, transform 0.4s ease;
    }

    .line.top {
      stroke-dasharray: 60 207;
    }

    .line.middle {
      stroke-dasharray: 60 60;
    }

    .line.bottom {
      stroke-dasharray: 60 207;
    }

    .line.top.active {
      stroke-dasharray: 90 207;
      stroke-dashoffset: -134;
      transform: translateY(0);
    }

    .line.middle.active {
      stroke-dasharray: 1 60;
      stroke-dashoffset: -30;
    }

    .line.bottom.active {
      stroke-dasharray: 90 207;
      stroke-dashoffset: -134;
      transform: translateY(0);
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .brand-icon {
      font-size: 1.5rem;
    }

    .brand-text {
      font-family: "Urbanist", "Poppins", sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      letter-spacing: 0.5px;
    }

    /* Right Actions */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .notification-btn {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }

    .notification-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }

    .notification-icon {
      font-size: 1.2rem;
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ff4757;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      border: 2px solid #a71617;
    }

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      border-radius: 25px;
      padding: 0.35rem 0.75rem 0.35rem 0.35rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .user-menu-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      color: #a71617;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .user-name {
      font-weight: 500;
      color: white;
      font-size: 0.9rem;
    }

    .dropdown-arrow {
      color: white;
      transition: transform 0.2s ease;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    /* Dropdown Menu */
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      min-width: 220px;
      padding: 0.5rem;
      z-index: 1002;
      animation: dropdownFadeIn 0.2s ease;
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      padding: 0.75rem 1rem;
    }

    .dropdown-user-name {
      font-weight: 600;
      color: #1a1a2e;
      font-size: 0.95rem;
    }

    .dropdown-user-role {
      font-size: 0.8rem;
      color: #666;
      margin-top: 2px;
    }

    .dropdown-divider {
      height: 1px;
      background: #eee;
      margin: 0.25rem 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #333;
      text-decoration: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 0.9rem;
    }

    .dropdown-item:hover {
      background: #f5f5f5;
    }

    .dropdown-item.danger {
      color: #dc3545;
    }

    .dropdown-item.danger:hover {
      background: rgba(220, 53, 69, 0.1);
    }

    .dropdown-icon {
      font-size: 1rem;
      width: 24px;
      text-align: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .brand-text {
        display: none;
      }

      .user-name {
        display: none;
      }

      .navbar {
        padding: 0 0.75rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SidebarService);
  private subscription?: Subscription;

  currentUser = this.authService.currentUser;
  isSidebarVisible = signal(false);
  isUserMenuOpen = signal(false);
  notificationCount = 3;

  ngOnInit(): void {
    this.subscription = this.sidebarService.sidebarVisible$.subscribe(isVisible => {
      this.isSidebarVisible.set(isVisible);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen.update(v => !v);
  }

  getRoleLabel(role?: string): string {
    const labels: Record<string, string> = {
      'WORKER': 'Technicien',
      'SUPERVISOR': 'Superviseur',
      'EMPLOYER': 'Employeur',
      'ADMIN': 'Administrateur',
      'HR': 'Ressources Humaines'
    };
    return role ? labels[role] || role : '';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.isUserMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
