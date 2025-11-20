import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  productos: number;
  usuarios: number;
  pedidos: number;
  ingresos: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // 🔥 Corregido: agregar /api/dashboard
  private url = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  // Llama cada 15 segundos
  getEstadisticasEnTiempoReal(): Observable<DashboardStats> {
    return timer(0, 15000).pipe(
      switchMap(() => this.http.get<DashboardStats>(this.url))
    );
  }
}
