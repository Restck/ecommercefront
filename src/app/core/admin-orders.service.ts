// src/app/core/admin-orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {

  // 👉 Ahora usa environment.apiUrl (Railway o localhost según build)
  private apiUrl = `${environment.apiUrl}/api/ordenes`;

  constructor(private http: HttpClient) {}

  obtenerOrdenes(): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}
