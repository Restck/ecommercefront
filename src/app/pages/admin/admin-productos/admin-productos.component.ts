import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto } from '../../../core/product.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-productos.component.html',
})
export class AdminProductosComponent {
  private productoService = inject(ProductoService);

  productos: Producto[] = [];

  constructor() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (res) => (this.productos = res),
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  eliminar(id: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    this.productoService.eliminarProducto(id).subscribe(() => {
      this.productos = this.productos.filter(p => p._id !== id);
    });
  }
}
