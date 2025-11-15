import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService, CartItem } from '../../../core/cart.service';
import { trigger, transition, style, animate } from '@angular/animations'; // ✅ Animaciones

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  animations: [ // ✅ Configuración de animaciones
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {
  carrito: CartItem[] = [];

  private cartService = inject(CartService);
  private router = inject(Router);

  ngOnInit(): void {
    this.carrito = this.cartService.obtenerCarrito();
  }

  actualizarCantidad(item: CartItem, cantidad: number): void {
    if (cantidad < 1) return;
    item.cantidad = cantidad;
    this.cartService.agregarAlCarrito(item.producto, 0); // fuerza actualización
    this.carrito = this.cartService.obtenerCarrito();
  }

  eliminarProducto(id: string): void {
    this.cartService.eliminarDelCarrito(id);
    this.carrito = this.cartService.obtenerCarrito();
  }

  vaciarCarrito(): void {
    this.cartService.vaciarCarrito();
    this.carrito = [];
  }

  total(): number {
    return this.cartService.obtenerTotal();
  }

  irACheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
