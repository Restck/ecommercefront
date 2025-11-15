import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  producto: any;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CartItem[] = [];
  private carritoSubject = new BehaviorSubject<CartItem[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  constructor(private authService: AuthService) {
    this.cargarCarrito();
  }

  /** ✅ Clave dinámica según el usuario */
  private obtenerClaveLocalStorage(): string {
    const user = this.authService.getUser();
    // Si no hay usuario logueado, usa una clave temporal
    return user && user._id ? `carrito_${user._id}` : 'carrito_invitado';
  }

  /** ✅ Carga el carrito correcto del usuario actual */
  private cargarCarrito(): void {
    const clave = this.obtenerClaveLocalStorage();
    const guardado = localStorage.getItem(clave);

    if (guardado) {
      try {
        this.items = JSON.parse(guardado);
      } catch {
        this.items = [];
      }
    } else {
      this.items = [];
    }

    this.carritoSubject.next([...this.items]);
  }

  /** ✅ Guarda el carrito solo del usuario actual */
  private actualizarEstado(): void {
    const clave = this.obtenerClaveLocalStorage();
    localStorage.setItem(clave, JSON.stringify(this.items));
    this.carritoSubject.next([...this.items]);
  }

  /** ✅ Cambia el carrito activo cuando el usuario cambia */
  recargarCarritoPorUsuario(): void {
    this.cargarCarrito();
  }

  agregarAlCarrito(producto: any, cantidad: number): void {
    const index = this.items.findIndex(i => i.producto._id === producto._id);

    if (index !== -1) {
      this.items[index].cantidad += cantidad;
    } else {
      this.items.push({ producto, cantidad });
    }

    this.actualizarEstado();
  }

  obtenerCarrito(): CartItem[] {
    return [...this.items];
  }

  eliminarDelCarrito(productoId: string): void {
    this.items = this.items.filter(item => item.producto._id !== productoId);
    this.actualizarEstado();
  }

  vaciarCarrito(): void {
    this.items = [];
    this.actualizarEstado();
  }

  obtenerTotal(): number {
    return this.items.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    );
  }

  obtenerCantidadTotal(): number {
    return this.items.reduce((acc, item) => acc + item.cantidad, 0);
  }

  carritoVacio(): boolean {
    return this.items.length === 0;
  }

  limpiarTemporal(): void {
    this.items = [];
  }
}
