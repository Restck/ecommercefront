import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
import { CartService } from '../../../core/cart.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-receipt-form',
  standalone: true,
  templateUrl: './receipt-form.component.html',
  styleUrls: ['./receipt-form.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        query('*', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule
  ]
})
export class ReceiptFormComponent {
  archivo: File | null = null;
  vistaPrevia: string | null = null;

  cargando = false;
  nombreArchivo = '';

  nombreTitular = '';
  referenciaPago = '';
  ordenId: string = '';

  // 🌐 URL Railway (actualizada)
  private apiBase = 'https://ecommerce-back-production-af8e.up.railway.app/api';

  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const state = history.state;
    if (state && state.ordenId) {
      this.ordenId = state.ordenId;
    } else {
      this.snackBar.open('❌ ID de orden no encontrado', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/carrito']);
    }
  }

  subirArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivo = input.files[0];
      this.nombreArchivo = this.archivo.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPrevia = reader.result as string;
      };
      reader.readAsDataURL(this.archivo);
    }
  }

  enviar(): void {
    if (!this.archivo || !this.nombreTitular.trim() || !this.referenciaPago.trim()) {
      this.snackBar.open('⚠️ Todos los campos son obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.ordenId) {
      this.snackBar.open('❌ ID de orden no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('comprobante', this.archivo);
    formData.append('nombreTitular', this.nombreTitular);
    formData.append('referenciaPago', this.referenciaPago);

    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.cargando = true;

    this.http.put(
      `${this.apiBase}/ordenes/${this.ordenId}/comprobante`,
      formData,
      { headers }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Comprobante subido correctamente', 'Cerrar', { duration: 3000 });

        this.cartService.vaciarCarrito();

        const usuario = this.authService.getUser();

        if (usuario?.rol === 'vendedor') {
          this.router.navigate(['/vendedor/pedidos-en-espera']);
        } else {
          this.router.navigate(['/cliente/mis-pedidos']);
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('❌ Error al subir comprobante', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }
}
