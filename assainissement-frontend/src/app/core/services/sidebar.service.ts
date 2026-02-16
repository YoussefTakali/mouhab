import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarVisible = new BehaviorSubject<boolean>(false);
  sidebarVisible$ = this.sidebarVisible.asObservable();

  toggleSidebar(isVisible?: boolean): void {
    if (isVisible !== undefined) {
      this.sidebarVisible.next(isVisible);
    } else {
      this.sidebarVisible.next(!this.sidebarVisible.value);
    }
  }

  closeSidebar(): void {
    this.sidebarVisible.next(false);
  }

  openSidebar(): void {
    this.sidebarVisible.next(true);
  }

  get isVisible(): boolean {
    return this.sidebarVisible.value;
  }
}
