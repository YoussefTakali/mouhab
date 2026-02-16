import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🔧</span>
          <span class="logo-text" *ngIf="!isCollapsed">AssainiPro</span>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()">
          {{ isCollapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        @for (item of filteredNavItems(); track item.path) {
          <a 
            [routerLink]="item.path" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isCollapsed ? item.label : ''"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="user-info">
          <div class="user-avatar">
            {{ currentUser()?.firstName?.charAt(0) }}{{ currentUser()?.lastName?.charAt(0) }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</div>
            <div class="user-role">{{ getRoleLabel(currentUser()?.role) }}</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 260px;
      background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: white;
      display: flex;
      flex-direction: column;
      transition: width var(--transition-speed) ease;
      z-index: 1000;
      box-shadow: var(--shadow-lg);
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      transition: background var(--transition-speed) ease;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all var(--transition-speed) ease;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-left-color: white;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-label {
      font-weight: 500;
      white-space: nowrap;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.875rem;
    }

    .sidebar.collapsed .sidebar-footer {
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  isCollapsed = false;
  currentUser = this.authService.currentUser;

  private navItems: NavItem[] = [
    { path: '/dashboard', label: 'Tableau de Bord', icon: '📊' },
    { path: '/missions', label: 'Missions', icon: '📋' },
    { path: '/calendar', label: 'Calendrier', icon: '📅' },
    { path: '/employees', label: 'Employés', icon: '👥', roles: ['SUPERVISOR', 'EMPLOYER', 'ADMIN', 'HR'] },
    { path: '/leaderboard', label: 'Classement', icon: '🏆' },
    { path: '/absences', label: 'Absences', icon: '🏖️' },
    { path: '/approvals', label: 'Approbations', icon: '✅', roles: ['SUPERVISOR', 'EMPLOYER', 'ADMIN'] },
    { path: '/profile', label: 'Mon Profil', icon: '👤' },
  ];

  filteredNavItems = computed(() => {
    const userRole = this.currentUser()?.role;
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return userRole && item.roles.includes(userRole);
    });
  });

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
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
}
