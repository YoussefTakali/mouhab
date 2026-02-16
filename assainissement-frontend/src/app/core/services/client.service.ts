import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Client, Payment } from '../models/client.model';
import { Mission } from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = `${environment.apiUrl}/clients`;

  constructor(private readonly http: HttpClient) {}

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.API_URL);
  }

  getActiveClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_URL}/active`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/${id}`);
  }

  searchClients(query: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_URL}/search`, { params: { q: query } });
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.API_URL, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/${id}`, client);
  }

  deactivateClient(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/deactivate`, {});
  }

  activateClient(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/activate`, {});
  }

  // Missions
  getClientMissions(clientId: number): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.API_URL}/${clientId}/missions`);
  }

  // Payments
  getClientPayments(clientId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.API_URL}/${clientId}/payments`);
  }

  createPayment(clientId: number, payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(`${this.API_URL}/${clientId}/payments`, payment);
  }

  updatePaymentStatus(paymentId: number, status: string): Observable<Payment> {
    return this.http.put<Payment>(`${this.API_URL}/payments/${paymentId}/status`, { status });
  }
}
