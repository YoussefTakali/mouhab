import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Mission } from '../models/mission.model';
import { Employee } from '../models/user.model';

export interface MapData {
  missions: Mission[];
  workers: Employee[];
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly API_URL = `${environment.apiUrl}/map`;

  constructor(private readonly http: HttpClient) {}

  getMapData(): Observable<MapData> {
    return this.http.get<MapData>(`${this.API_URL}/data`);
  }

  getMissionsWithLocation(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/missions`);
  }

  getWorkersWithLocation(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.API_URL}/workers`);
  }
}
