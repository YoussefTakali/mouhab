import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { DashboardStats, PointTransaction } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;
  private readonly POINTS_URL = `${environment.apiUrl}/points`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats`);
  }

  getEmployeeDashboardStats(employeeId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats/employee/${employeeId}`);
  }

  getMyDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/my-stats`);
  }

  getEmployeeTransactions(employeeId: number): Observable<PointTransaction[]> {
    return this.http.get<PointTransaction[]>(`${this.POINTS_URL}/employee/${employeeId}`);
  }

  getEmployeeTransactionsByRange(employeeId: number, start: Date, end: Date): Observable<PointTransaction[]> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<PointTransaction[]>(`${this.POINTS_URL}/employee/${employeeId}/range`, { params });
  }

  getTotalPoints(employeeId: number): Observable<number> {
    return this.http.get<number>(`${this.POINTS_URL}/employee/${employeeId}/total`);
  }

  manualPointAdjustment(employeeId: number, points: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.POINTS_URL}/employee/${employeeId}/adjust`, { points, reason });
  }
}
