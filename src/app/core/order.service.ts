// src/app/core/order.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// ======================
// 📦 Interfaces
// ======================
export interface ProductoOrder {
  producto: {
    _id: string;
    nombre: string;
    precio: number;
    imagen: string;
  };
  cantidad: number;
  vendedor?: {
    _id: string;
    nombre: string;
    correo: string;
  };
}

export interface CrearPedidoDTO {
  productos: { producto: string; cantidad: number }[];
  total: number;
  metodoPago: 'Nequi';
  telefono: string;
  ciudad: string;
  nombre?: string;
  direccion?: string;
  indicaciones?: string;
}

export interface Order {
  _id?: string;
  usuario?: { _id: string; nombre: string; correo: string };
  cliente?: { _id: string; nombre: string; correo: string };
  creadoPor?: { _id: string; nombre: string; correo: string; rol: 'cliente' | 'vendedor' };
  productos: ProductoOrder[];
  fecha?: string;
  total: number;
  estado: 'pendiente' | 'verificado' | 'rechazado' | 'enviado' | 'entregado' | 'confirmado';
  comprobante?: string;
  estadoComprobante?: 'pendiente' | 'aprobado' | 'rechazado';
  metodoPago: 'Nequi';
  telefono: string;
  ciudad: string;
  nombre?: string;
  direccion?: string;
  indicaciones?: string;
}

// ======================
// 🚀 Servicio principal
// ======================
@Injectable({ providedIn: 'root' })
export class OrderService {

  // 🔗 Ruta base actualizada con environment
  private readonly apiUrl = `${environment.apiUrl}/ordenes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // 🔑 Headers con token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // 🛒 Crear nuevo pedido (cliente)
  crearPedido(pedido: CrearPedidoDTO): Observable<{ mensaje: string; pedido: Order }> {
    return this.http.post<{ mensaje: string; pedido: Order }>(
      this.apiUrl,
      pedido,
      { headers: this.getAuthHeaders().set('Content-Type', 'application/json') }
    );
  }

  // 📎 Subir comprobante
  subirComprobante(ordenId: string, archivo: File): Observable<{ mensaje: string; orden: Order }> {
    const formData = new FormData();
    formData.append('comprobante', archivo);

    return this.http.put<{ mensaje: string; orden: Order }>(
      `${this.apiUrl}/${ordenId}/comprobante`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // 📦 Obtener todos los pedidos (admin)
  obtenerPedidos(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // 🧍 Obtener pedidos de un cliente (solo admin)
  getPedidosPorCliente(clienteId: string): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}/cliente/${clienteId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // 👤 Obtener pedidos del cliente logueado
  getMisPedidos(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mis`, {
      headers: this.getAuthHeaders()
    });
  }

  // 🛍️ Pedidos vendidos por el vendedor logueado
  getPedidosVendedor(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mis-vendidos`, {
      headers: this.getAuthHeaders()
    });
  }

  // 🧑‍💼 Admin: obtener pedidos por vendedor
  getPedidosPorVendedorAdmin(vendedorId: string): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}/vendedor/${vendedorId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // 🔄 Actualizar estado del pedido
  actualizarEstadoPedido(id: string, estado: Order['estado']): Observable<{ mensaje: string; pedido: Order }> {
    return this.http.put<{ mensaje: string; pedido: Order }>(
      `${this.apiUrl}/${id}/estado`,
      { estado },
      { headers: this.getAuthHeaders().set('Content-Type', 'application/json') }
    );
  }

  // ✅ Estado del comprobante
  actualizarEstadoComprobante(orderId: string, estado: 'pendiente' | 'aprobado' | 'rechazado'): Observable<{ mensaje: string; orden: Order }> {
    return this.http.put<{ mensaje: string; orden: Order }>(
      `${this.apiUrl}/${orderId}/estado-comprobante`,
      { estado },
      { headers: this.getAuthHeaders().set('Content-Type', 'application/json') }
    );
  }

  // ⚠️ Confirmar pedido → descuenta stock
  confirmarPedido(orderId: string): Observable<{ mensaje: string; pedido: Order }> {
    return this.http.put<{ mensaje: string; pedido: Order }>(
      `${this.apiUrl}/${orderId}/confirmar`,
      {},
      { headers: this.getAuthHeaders().set('Content-Type', 'application/json') }
    );
  }

  // ✏️ Actualizar pedido completo
  actualizarPedidoCompleto(id: string, cambios: Partial<Order>): Observable<{ mensaje: string; pedido: Order }> {
    return this.http.put<{ mensaje: string; pedido: Order }>(
      `${this.apiUrl}/${id}`,
      cambios,
      { headers: this.getAuthHeaders().set('Content-Type', 'application/json') }
    );
  }

  // 🗑️ Eliminar pedido
  eliminarPedido(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
