// archivo: src/app/core/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'cliente' | 'vendedor';
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // 🔐 Obtener token con headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ===========================
  // 👥 Obtener lista de usuarios
  // ===========================
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // ===========================
  // 🔄 Actualizar rol del usuario
  // ===========================
  actualizarRol(
    id: string,
    nuevoRol: 'admin' | 'cliente' | 'vendedor'
  ): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}/rol`,
      { rol: nuevoRol },
      { headers: this.getAuthHeaders() }
    );
  }
}
