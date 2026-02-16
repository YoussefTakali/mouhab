import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Employee } from '../models/user.model';
import { Leaderboard } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly API_URL = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.API_URL);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.API_URL}/${id}`);
  }

  getEmployeeByUserId(userId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.API_URL}/user/${userId}`);
  }

  getTeamMembers(supervisorId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.API_URL}/supervisor/${supervisorId}/team`);
  }

  getEmployeesBySkill(skill: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.API_URL}/skill/${skill}`);
  }

  getNearbyEmployees(latitude: number, longitude: number, distanceKm: number = 10): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.API_URL}/nearby`, {
      params: { latitude: latitude.toString(), longitude: longitude.toString(), distanceKm: distanceKm.toString() }
    });
  }

  getTopPerformers(limit: number = 10): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.API_URL}/top-performers`, {
      params: { limit: limit.toString() }
    });
  }

  getLeaderboard(period: string = 'monthly'): Observable<Leaderboard> {
    return this.http.get<Leaderboard>(`${this.API_URL}/leaderboard`, {
      params: { period }
    });
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.API_URL}/${id}`, employee);
  }

  updateLocation(id: number, latitude: number, longitude: number, address?: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/location`, { latitude, longitude, address });
  }
}
