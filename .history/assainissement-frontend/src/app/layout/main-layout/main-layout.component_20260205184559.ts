import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-header />
      <app-sidebar />
      
      <!-- Backdrop for mobile -->
      <div 
        class="sidebar-backdrop" 
        [class.visible]="isSidebarVisible()"
        (click)="closeSidebar()"
      ></div>

      <main class="main-content" [class.sidebar-open]="isSidebarVisible()">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      background: #f5f6fa;
    }

    .main-content {
      margin-top: 64px;
      padding: 2rem;
      min-height: calc(100vh - 64px);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-content.sidebar-open {
      margin-left: 280px;
    }

    /* Backdrop */
    .sidebar-backdrop {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .sidebar-backdrop.visible {
      opacity: 1;
      visibility: visible;
    }

    @media (max-width: 1024px) {
      .main-content.sidebar-open {
        margin-left: 0;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly sidebarService = inject(SidebarService);
  private subscription?: Subscription;

  isSidebarVisible = signal(false);

  ngOnInit(): void {
    this.subscription = this.sidebarService.sidebarVisible$.subscribe(isVisible => {
      this.isSidebarVisible.set(isVisible);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  closeSidebar(): void {
    this.sidebarService.closeSidebar();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth <= 768) {
      this.sidebarService.closeSidebar();
    }
  }
}
