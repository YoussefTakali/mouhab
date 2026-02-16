import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { User, Employee, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly EMPLOYEE_KEY = 'current_employee';

  private currentUserSignal = signal<User | null>(null);
  private currentEmployeeSignal = signal<Employee | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  currentEmployee = this.currentEmployeeSignal.asReadonly();
  
  isAuthenticated = computed(() => !!this.currentUserSignal());
  isWorker = computed(() => this.currentUserSignal()?.role === 'WORKER');
  isSupervisor = computed(() => ['SUPERVISOR', 'EMPLOYER', 'ADMIN'].includes(this.currentUserSignal()?.role || ''));
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  isHR = computed(() => ['HR', 'ADMIN'].includes(this.currentUserSignal()?.role || ''));

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    const employeeJson = localStorage.getItem(this.EMPLOYEE_KEY);

    if (token && userJson) {
      try {
        this.currentUserSignal.set(JSON.parse(userJson));
        if (employeeJson) {
          this.currentEmployeeSignal.set(JSON.parse(employeeJson));
        }
      } catch {
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  refreshCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/me`).pipe(
      tap(response => {
        this.currentUserSignal.set(response.user);
        if (response.employee) {
          this.currentEmployeeSignal.set(response.employee);
        }
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        if (response.employee) {
          localStorage.setItem(this.EMPLOYEE_KEY, JSON.stringify(response.employee));
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);

    if (response.employee) {
      localStorage.setItem(this.EMPLOYEE_KEY, JSON.stringify(response.employee));
      this.currentEmployeeSignal.set(response.employee);
    }
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EMPLOYEE_KEY);
    this.currentUserSignal.set(null);
    this.currentEmployeeSignal.set(null);
  }
}
