import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Photo, PhotoType } from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly API_URL = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}

  uploadPhoto(
    missionId: number,
    file: File,
    type: PhotoType,
    latitude?: number,
    longitude?: number,
    address?: string,
    deviceId?: string,
    deviceModel?: string,
    fromGallery: boolean = false
  ): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('missionId', missionId.toString());
    formData.append('type', type);
    formData.append('fromGallery', fromGallery.toString());
    
    if (latitude !== undefined) formData.append('latitude', latitude.toString());
    if (longitude !== undefined) formData.append('longitude', longitude.toString());
    if (address) formData.append('address', address);
    if (deviceId) formData.append('deviceId', deviceId);
    if (deviceModel) formData.append('deviceModel', deviceModel);

    return this.http.post<Photo>(`${this.API_URL}/upload`, formData);
  }

  getPhotosByMission(missionId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.API_URL}/mission/${missionId}`);
  }

  getBeforePhotos(missionId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.API_URL}/mission/${missionId}/before`);
  }

  getAfterPhotos(missionId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.API_URL}/mission/${missionId}/after`);
  }

  getPhotoUrl(photoId: number): string {
    return `${this.API_URL}/${photoId}/content`;
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${photoId}`);
  }

  hasRequiredPhotos(missionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/mission/${missionId}/has-required`);
  }
}
