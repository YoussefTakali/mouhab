import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Absence, AbsenceStatus } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private readonly API_URL = `${environment.apiUrl}/absences`;

  constructor(private http: HttpClient) {}

  getAllAbsences(): Observable<Absence[]> {
    return this.http.get<Absence[]>(this.API_URL);
  }

  getPendingAbsences(): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.API_URL}/pending`);
  }

  getEmployeeAbsences(employeeId: number): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.API_URL}/employee/${employeeId}`);
  }

  getAbsencesOnDate(date: Date): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.API_URL}/date/${date.toISOString().split('T')[0]}`);
  }

  getAbsencesBetween(start: Date, end: Date): Observable<Absence[]> {
    const params = new HttpParams()
      .set('start', start.toISOString().split('T')[0])
      .set('end', end.toISOString().split('T')[0]);
    return this.http.get<Absence[]>(`${this.API_URL}/range`, { params });
  }

  isEmployeeAbsent(employeeId: number, date: Date): Observable<boolean> {
    const params = new HttpParams().set('date', date.toISOString().split('T')[0]);
    return this.http.get<boolean>(`${this.API_URL}/employee/${employeeId}/is-absent`, { params });
  }

  createAbsence(absence: Partial<Absence>): Observable<Absence> {
    return this.http.post<Absence>(this.API_URL, absence);
  }

  approveAbsence(id: number): Observable<Absence> {
    return this.http.put<Absence>(`${this.API_URL}/${id}/approve`, {});
  }

  rejectAbsence(id: number, notes: string): Observable<Absence> {
    return this.http.put<Absence>(`${this.API_URL}/${id}/reject`, { notes });
  }

  cancelAbsence(id: number): Observable<Absence> {
    return this.http.put<Absence>(`${this.API_URL}/${id}/cancel`, {});
  }
}
