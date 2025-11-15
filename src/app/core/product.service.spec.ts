import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = 'http://localhost:5000/api'; // 🔹 Ajusta la URL de tu backend

  constructor(private http: HttpClient) {}

  // =========================
  // 📦 PRODUCTOS
  // =========================

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  getProductoPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/productos/${id}`);
  }

  crearProducto(producto: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productos`, producto);
  }

  actualizarProducto(id: string, producto: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/productos/${id}`, producto);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${id}`);
  }

  // =========================
  // 📂 CATEGORÍAS
  // =========================

  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }

  crearCategoria(nombre: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categorias`, { nombre });
  }

  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categorias/${id}`);
  }

  // =========================
  // 🏢 PROVEEDORES
  // =========================

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores`);
  }

  crearProveedor(nombre: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proveedores`, { nombre });
  }

  eliminarProveedor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/proveedores/${id}`);
  }
}
