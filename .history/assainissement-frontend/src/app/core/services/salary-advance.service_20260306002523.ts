import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { SalaryAdvance } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class SalaryAdvanceService {
  private readonly API_URL = `${environment.apiUrl}/salary-advances`;

  constructor(private readonly http: HttpClient) {}

  getAllAdvances(): Observable<SalaryAdvance[]> {
    return this.http.get<SalaryAdvance[]>(this.API_URL);
  }

  getPendingAdvances(): Observable<SalaryAdvance[]> {
    return this.http.get<SalaryAdvance[]>(`${this.API_URL}/pending`);
  }

  getEmployeeAdvances(employeeId: number): Observable<SalaryAdvance[]> {
    return this.http.get<SalaryAdvance[]>(`${this.API_URL}/employee/${employeeId}`);
  }

  getMyAdvances(): Observable<SalaryAdvance[]> {
    return this.http.get<SalaryAdvance[]>(`${this.API_URL}/my-advances`);
  }

  createAdvance(advance: Partial<SalaryAdvance>): Observable<SalaryAdvance> {
    return this.http.post<SalaryAdvance>(this.API_URL, advance);
  }

  approveAdvance(id: number): Observable<SalaryAdvance> {
    return this.http.post<SalaryAdvance>(`${this.API_URL}/${id}/approve`, {});
  }

  rejectAdvance(id: number, reason: string): Observable<SalaryAdvance> {
    return this.http.post<SalaryAdvance>(`${this.API_URL}/${id}/reject`, { reason });
  }

  markAsPaid(id: number): Observable<SalaryAdvance> {
    return this.http.post<SalaryAdvance>(`${this.API_URL}/${id}/mark-paid`, {});
  }
}
