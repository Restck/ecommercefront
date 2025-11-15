import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Producto } from '../../../core/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input({ required: true }) producto!: Producto;

  agregarAlCarrito(): void {
    // Idealmente se integrará con un CartService (no hardcoded)
    console.log('🛒 Producto añadido al carrito:', this.producto);
    alert(`✅ Producto añadido al carrito: ${this.producto.nombre}`);
  }

  verDetalle(): void {
    // Este método está disponible si decides usar navegación programática
    // this.router.navigate(['/productos', this.producto._id]);
  }
}
