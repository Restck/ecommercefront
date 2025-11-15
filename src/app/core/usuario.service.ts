// archivo: src/app/core/usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Asegúrate de importar HttpHeaders
import { Observable } from 'rxjs';

export interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'cliente' | 'vendedor';
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:5000/api/usuarios';

  constructor(private http: HttpClient) {}

  // Método que debes modificar para enviar el token
  obtenerUsuarios(): Observable<Usuario[]> {
    const token = localStorage.getItem('token'); // Obtén el token
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    
    return this.http.get<Usuario[]>(this.apiUrl, { headers }); // <-- Aquí pasas los headers con el token
  }

  // Método actualizarRol ya modificado
  actualizarRol(id: string, nuevoRol: 'admin' | 'cliente' | 'vendedor'): Observable<Usuario> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/rol`, { rol: nuevoRol }, { headers });
  }
}
