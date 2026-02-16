import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast" 
          [class]="'toast-' + toast.type"
          (click)="toastService.remove(toast.id)"
        >
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      background: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast-success {
      border-left: 4px solid #4caf50;
    }

    .toast-error {
      border-left: 4px solid #f44336;
    }

    .toast-warning {
      border-left: 4px solid #ff9800;
    }

    .toast-info {
      border-left: 4px solid #2196f3;
    }

    .toast-icon {
      font-size: 1.25rem;
    }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 0.875rem;
      color: var(--text-light);
      cursor: pointer;
      padding: 0.25rem;
    }

    .toast-close:hover {
      color: var(--text-color);
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
}
