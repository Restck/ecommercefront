import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../../core/order.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule
  ],
})
export class PaymentComponent implements OnInit {
  total = 0;
  numeroNequi = '3001234567';
  qrUrl = '';
  pedidoId = '';
  modo: 'normal' | 'excedente' | 'vendedor' = 'normal';
  direccion = '';
  telefono = '';
  ciudad = '';
  nombre = '';
  indicaciones = '';
  productos: any[] = [];
  loading = true;

  // 🔥 Enlace actualizado a Railway
  private apiBase = 'https://ecommerce-back-production-af8e.up.railway.app/secure';

  constructor(
    private router: Router,
    private http: HttpClient,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    try {
      const state = history.state;
      if (state?.modo) this.modo = state.modo;

      const checkoutDataRaw = localStorage.getItem('checkoutData');
      if (checkoutDataRaw) {
        const datos = JSON.parse(checkoutDataRaw);
        this.total = Number(datos.total) || 0;
        this.modo = datos.modo ?? this.modo;
        this.productos = Array.isArray(datos.productos) ? datos.productos : [];

        if (datos.cliente) {
          this.nombre = datos.cliente.nombre ?? '';
          this.telefono = datos.cliente.telefono ?? '';
          this.ciudad = datos.cliente.ciudad ?? '';
          this.direccion = datos.cliente.direccion ?? '';
          this.indicaciones = datos.cliente.indicaciones ?? '';
        } else {
          this.nombre = datos.nombre ?? '';
          this.telefono = datos.telefono ?? '';
          this.ciudad = datos.ciudad ?? '';
          this.direccion = datos.direccion ?? '';
          this.indicaciones = datos.indicaciones ?? '';
        }
      }

      this.obtenerQrSeguro();
    } catch (error) {
      console.error('Error en PaymentComponent:', error);
      this.router.navigate(['/carrito']);
    }
  }

  private obtenerQrSeguro(): void {
    this.loading = true;
    this.http.get<{ token: string }>(`${this.apiBase}/token`).subscribe({
      next: (res) => {
        const token = res.token;
        this.qrUrl = `${this.apiBase}/qr-nequi?token=${token}`;
        this.loading = false;
      },
      error: () => {
        this.qrUrl = 'assets/img/qr-fallback.png';
        this.loading = false;
      },
    });
  }

  onQrError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/qr-fallback.png';
  }

  volverAlCarrito(): void {
    this.snackBar.open('Compra cancelada. No se generó ningún pedido.', 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-warning']
    });

    localStorage.removeItem('checkoutData');
    this.router.navigate(['/carrito']);
  }

  continuar(): void {
    if (this.total <= 0 || !this.productos.length) {
      this.snackBar.open('Datos del pedido inválidos', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/carrito']);
      return;
    }

    if (!this.nombre || !this.telefono || !this.ciudad || !this.direccion) {
      this.snackBar.open('Faltan datos del comprador.', 'Cerrar', { duration: 3000 });
      return;
    }

    const productosFormateados = this.productos.map((item: any) => {
      const idProducto = item._id || item.producto?._id || item.producto || null;
      return idProducto ? { producto: idProducto, cantidad: item.cantidad ?? 1 } : null;
    }).filter(p => !!p);

    const pedido = {
      productos: productosFormateados,
      total: this.total,
      metodoPago: 'Nequi' as const,
      nombre: this.nombre,
      telefono: this.telefono,
      ciudad: this.ciudad,
      direccion: this.direccion,
      indicaciones: this.indicaciones
    };

    this.orderService.crearPedido(pedido).subscribe({
      next: (res) => {
        const pedidoId = res.pedido?._id || '';
        localStorage.setItem('ordenId', pedidoId);

        this.router.navigate(['/subir-recibo'], {
          state: {
            ordenId: pedidoId,
            modo: this.modo,
            total: this.total,
            direccion: this.direccion,
            telefono: this.telefono,
            ciudad: this.ciudad,
            productos: this.productos,
          },
        });
      },
      error: (err) => {
        const msg = err.error?.mensaje || 'Error al crear el pedido.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
