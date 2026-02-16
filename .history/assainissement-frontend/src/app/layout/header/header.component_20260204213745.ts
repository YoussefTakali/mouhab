import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">{{ getPageTitle() }}</h1>
      </div>

      <div class="header-right">
        <div class="notifications">
          <button class="notification-btn" title="Notifications">
            🔔
            <span class="notification-badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
          </button>
        </div>

        <div class="user-menu">
          <button class="user-menu-btn" (click)="toggleUserMenu()">
            <div class="user-avatar">
              {{ currentUser()?.firstName?.charAt(0) }}{{ currentUser()?.lastName?.charAt(0) }}
            </div>
            <span class="user-name">{{ currentUser()?.firstName }}</span>
            <span class="dropdown-icon">▼</span>
          </button>

          <div class="dropdown-menu" *ngIf="isUserMenuOpen" (click)="closeUserMenu()">
            <a class="dropdown-item" (click)="navigateTo('/profile')">
              <span class="dropdown-icon-left">👤</span>
              Mon Profil
            </a>
            <a class="dropdown-item" (click)="navigateTo('/settings')">
              <span class="dropdown-icon-left">⚙️</span>
              Paramètres
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item danger" (click)="logout()">
              <span class="dropdown-icon-left">🚪</span>
              Déconnexion
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-btn {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      padding: 0.5rem;
      cursor: pointer;
      position: relative;
      border-radius: 8px;
      transition: background var(--transition-speed) ease;
    }

    .notification-btn:hover {
      background: var(--background-color);
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--danger-color);
      color: white;
      font-size: 0.625rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .user-menu {
      position: relative;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background var(--transition-speed) ease;
    }

    .user-menu-btn:hover {
      background: var(--background-color);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .user-name {
      font-weight: 500;
      color: var(--text-color);
    }

    .dropdown-icon {
      font-size: 0.625rem;
      color: var(--text-light);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      min-width: 200px;
      padding: 0.5rem;
      z-index: 1000;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-color);
      text-decoration: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background var(--transition-speed) ease;
    }

    .dropdown-item:hover {
      background: var(--background-color);
    }

    .dropdown-item.danger {
      color: var(--danger-color);
    }

    .dropdown-item.danger:hover {
      background: rgba(220, 53, 69, 0.1);
    }

    .dropdown-icon-left {
      font-size: 1rem;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.5rem 0;
    }

    @media (max-width: 768px) {
      .header {
        padding: 1rem;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isUserMenuOpen = false;
  notificationCount = 3;

  private pageTitles: Record<string, string> = {
    '/dashboard': 'Tableau de Bord',
    '/missions': 'Gestion des Missions',
    '/calendar': 'Calendrier',
    '/employees': 'Gestion des Employés',
    '/leaderboard': 'Classement',
    '/absences': 'Gestion des Absences',
    '/approvals': 'Approbations',
    '/profile': 'Mon Profil',
    '/settings': 'Paramètres'
  };

  getPageTitle(): string {
    const path = this.router.url.split('?')[0];
    return this.pageTitles[path] || 'AssainiPro';
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeUserMenu();
  }

  logout(): void {
    this.authService.logout();
  }
}
