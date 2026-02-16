import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Mission, MissionStatus } from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private readonly API_URL = `${environment.apiUrl}/missions`;

  constructor(private readonly http: HttpClient) {}

  getAllMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(this.API_URL);
  }

  getMission(id: number): Observable<Mission> {
    return this.http.get<Mission>(`${this.API_URL}/${id}`);
  }

  getMissionsByEmployee(employeeId: number): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/employee/${employeeId}`);
  }

  getMissionsByEmployeeAndStatus(employeeId: number, status: MissionStatus): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/employee/${employeeId}/status/${status}`);
  }

  getMissionsForCalendar(start: Date, end: Date): Observable<Mission[]> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<Mission[]>(`${this.API_URL}/calendar`, { params });
  }

  getEmployeeMissionsForCalendar(employeeId: number, start: Date, end: Date): Observable<Mission[]> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<Mission[]>(`${this.API_URL}/employee/${employeeId}/calendar`, { params });
  }

  getUrgentMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/urgent`);
  }

  getMissionsAwaitingApproval(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/awaiting-approval`);
  }

  getUnassignedMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/unassigned`);
  }

  createMission(mission: Partial<Mission>): Observable<Mission> {
    return this.http.post<Mission>(this.API_URL, mission);
  }

  assignMission(missionId: number, employeeId: number): Observable<Mission> {
    return this.http.put<Mission>(`${this.API_URL}/${missionId}/assign/${employeeId}`, {});
  }

  updateStatus(missionId: number, status: MissionStatus): Observable<Mission> {
    return this.http.put<Mission>(`${this.API_URL}/${missionId}/status`, { status });
  }

  approveMission(missionId: number, notes?: string): Observable<Mission> {
    return this.http.put<Mission>(`${this.API_URL}/${missionId}/approve`, { notes });
  }

  rejectMission(missionId: number, reason: string): Observable<Mission> {
    return this.http.put<Mission>(`${this.API_URL}/${missionId}/reject`, { reason });
  }

  updateChecklist(missionId: number, checklistId: number, completed: boolean): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${missionId}/checklist/${checklistId}`, { completed });
  }
}
