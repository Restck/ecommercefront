import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  _id: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  // 🔥 Corregido: agregar /api/categorias
  private baseUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  // 👉 Obtener todas las categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  // ➕ Crear una nueva categoría
  crearCategoria(nombre: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, { nombre });
  }

  // 🗑️ Eliminar una categoría por ID
  eliminarCategoria(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
