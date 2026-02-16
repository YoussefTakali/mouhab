import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Photo, PhotoType } from '../models/mission.model';

export interface PhotoUploadOptions {
  missionId: number;
  file: File;
  type: PhotoType;
  latitude?: number;
  longitude?: number;
  address?: string;
  deviceId?: string;
  deviceModel?: string;
  fromGallery?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly API_URL = `${environment.apiUrl}/photos`;

  constructor(private readonly http: HttpClient) {}

  uploadPhoto(options: PhotoUploadOptions): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('missionId', options.missionId.toString());
    formData.append('type', options.type);
    formData.append('fromGallery', (options.fromGallery ?? false).toString());
    
    if (options.latitude !== undefined) formData.append('latitude', options.latitude.toString());
    if (options.longitude !== undefined) formData.append('longitude', options.longitude.toString());
    if (options.address) formData.append('address', options.address);
    if (options.deviceId) formData.append('deviceId', options.deviceId);
    if (options.deviceModel) formData.append('deviceModel', options.deviceModel);

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

  getPhotoBlob(photoId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${photoId}/content`, { responseType: 'blob' });
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${photoId}`);
  }

  hasRequiredPhotos(missionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/mission/${missionId}/has-required`);
  }
}
