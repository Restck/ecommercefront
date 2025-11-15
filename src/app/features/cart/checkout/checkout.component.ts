import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { CartService, CartItem } from '../../../core/cart.service';
import { OrderService } from '../../../core/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class CheckoutComponent implements OnInit {
  nombre = '';
  email = '';
  telefono = '';
  ciudad = '';
  direccion = '';
  indicaciones = '';

  carrito: CartItem[] = [];
  total = 0;
  modoExcedente = false;

  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private orderService = inject(OrderService);

  ngOnInit(): void {
    const checkoutDataRaw = localStorage.getItem('checkoutData');

    if (checkoutDataRaw) {
      try {
        const data = JSON.parse(checkoutDataRaw);

        // 🟢 Si es modo excedente, continuar directo a pago
        if (data.modo === 'excedente' && data.pedidoId && data.total > 0) {
          this.modoExcedente = true;
          console.log('💡 Reanudando flujo excedente...');
          this.router.navigate(['/pago'], {
            state: {
              modo: 'excedente',
              pedidoId: data.pedidoId,
              total: data.total
            }
          });
          return;
        } else {
          localStorage.removeItem('checkoutData');
        }
      } catch (error) {
        console.warn('⚠️ Error al leer checkoutData:', error);
        localStorage.removeItem('checkoutData');
      }
    }

    // 🧾 Cargar datos del carrito
    this.carrito = this.cartService.obtenerCarrito();
    this.total = this.cartService.obtenerTotal();
  }

  procesarPago(): void {
    // 🚫 Si es modo excedente, saltar el formulario y redirigir directamente
    if (this.modoExcedente) {
      const data = JSON.parse(localStorage.getItem('checkoutData')!);
      this.router.navigate(['/pago'], {
        state: { modo: 'excedente', pedidoId: data.pedidoId, total: data.total }
      });
      return;
    }

    // 🧩 Flujo normal: validar y guardar datos temporalmente
    if (!this.validarCampos()) return;

    const checkoutData = {
      total: this.total,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      ciudad: this.ciudad,
      direccion: this.direccion,
      indicaciones: this.indicaciones,
      productos: this.carrito,
      modo: 'normal'
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    this.mostrarSnack('✅ Datos guardados. Continúa al pago.', 'success');

    // 🚀 Redirigir al pago (pedido aún NO creado)
    this.router.navigate(['/pago']);
  }

  private validarCampos(): boolean {
    if (!this.nombre.trim() || !this.email.trim() || !this.telefono.trim() ||
        !this.ciudad.trim() || !this.direccion.trim()) {
      this.mostrarSnack('⚠️ Todos los campos obligatorios deben estar llenos', 'warning');
      return false;
    }

    const direccionValida = /^[a-zA-Z0-9\s#\-\.]{5,}$/.test(this.direccion.trim());
    if (!direccionValida) {
      this.mostrarSnack('📍 Ingresa una dirección válida', 'warning');
      return false;
    }

    const telefonoValido = /^[0-9]{7,12}$/.test(this.telefono.trim());
    if (!telefonoValido) {
      this.mostrarSnack('📞 Ingresa un número de teléfono válido', 'warning');
      return false;
    }

    return true;
  }

  private mostrarSnack(mensaje: string, tipo: 'error' | 'warning' | 'success'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${tipo}`]
    });
  }
}
