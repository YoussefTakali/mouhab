import { Component, computed, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

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
    <aside class="sidebar" [class.visible]="isVisible()">
      <nav class="sidebar-nav">
        @for (item of filteredNavItems(); track item.path) {
          <a 
            [routerLink]="item.path" 
            routerLinkActive="active"
            class="nav-item"
            (click)="onNavClick()"
          >
            <span class="nav-icon"><i [class]="item.icon"></i></span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
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
      left: -290px;
      top: 64px;
      height: calc(100vh - 64px);
      width: 280px;
      background: white;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      box-shadow: 4px 0 25px rgba(0, 0, 0, 0.15);
      border-right: 1px solid rgba(0, 0, 0, 0.08);
    }

    .sidebar.visible {
      left: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.25rem;
      color: #1a1a2e;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s ease;
      font-family: "Urbanist", "Poppins", sans-serif;
      font-weight: 500;
      font-size: 0.95rem;
      position: relative;
    }

    .nav-item:hover {
      background: #f5f5f5;
      transform: translateX(4px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #a71617 0%, #c9190d 100%);
      color: white;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(167, 22, 23, 0.3);
    }

    .nav-item.active::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 4px;
      background: white;
      border-radius: 0 4px 4px 0;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 28px;
      text-align: center;
      opacity: 0.85;
    }

    .nav-item.active .nav-icon {
      opacity: 1;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid #eee;
      background: #fafafa;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a71617 0%, #c9190d 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(167, 22, 23, 0.3);
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: #666;
      margin-top: 2px;
    }

    /* Scrollbar */
    .sidebar-nav::-webkit-scrollbar {
      width: 5px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 10px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav:hover::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.25);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 85%;
        max-width: 300px;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly sidebarService = inject(SidebarService);
  private subscription?: Subscription;

  isVisible = signal(false);
  currentUser = this.authService.currentUser;

  private readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Tableau de Bord', icon: 'fa-solid fa-gauge-high' },
    { path: '/missions', label: 'Missions', icon: 'fa-solid fa-clipboard-list' },
    { path: '/calendar', label: 'Calendrier', icon: 'fa-regular fa-calendar-days' },
    { path: '/employees', label: 'Employés', icon: 'fa-solid fa-users', roles: ['SUPERVISOR', 'EMPLOYER', 'ADMIN', 'HR'] },
    { path: '/leaderboard', label: 'Classement', icon: 'fa-solid fa-trophy' },
    { path: '/absences', label: 'Absences', icon: 'fa-solid fa-umbrella-beach' },
    { path: '/approvals', label: 'Approbations', icon: 'fa-solid fa-circle-check', roles: ['SUPERVISOR', 'EMPLOYER', 'ADMIN'] },
    { path: '/profile', label: 'Mon Profil', icon: 'fa-solid fa-user' },
  ];

  filteredNavItems = computed(() => {
    const userRole = this.currentUser()?.role;
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return userRole && item.roles.includes(userRole);
    });
  });

  ngOnInit(): void {
    this.subscription = this.sidebarService.sidebarVisible$.subscribe(isVisible => {
      this.isVisible.set(isVisible);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNavClick(): void {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      this.sidebarService.closeSidebar();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth <= 768) {
      this.sidebarService.closeSidebar();
    }
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
