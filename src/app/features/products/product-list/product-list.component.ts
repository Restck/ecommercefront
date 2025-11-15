import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../../core/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];

  terminoBusqueda: string = '';
  categoriaSeleccionada: string = '';

  cargando = true;
  error: string | null = null;

  private productoService = inject(ProductoService);

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = null;

    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.categorias = this.extraerCategorias(data);
        this.productosFiltrados = [...this.productos];
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando productos:', err);
        this.error = 'Hubo un problema al cargar los productos.';
        this.cargando = false;
      }
    });
  }

  extraerCategorias(productos: Producto[]): string[] {
    const categoriasSet = new Set<string>();
    productos.forEach(p => {
      const nombreCategoria = this.obtenerNombreCategoria(p);
      categoriasSet.add(nombreCategoria);
    });
    return Array.from(categoriasSet).sort();
  }

  obtenerNombreCategoria(producto: Producto): string {
    return producto.categoria?.nombre || 'Sin categoría';
  }

  onSearch(termino: string): void {
    this.terminoBusqueda = termino.trim().toLowerCase();
    this.filtrarProductos();
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.filtrarProductos();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = '';
    this.filtrarProductos();
  }

  filtrarProductos(): void {
    this.productosFiltrados = this.productos.filter(producto => {
      const nombreCategoria = this.obtenerNombreCategoria(producto);

      const coincideCategoria =
        !this.categoriaSeleccionada || nombreCategoria === this.categoriaSeleccionada;

      const coincideBusqueda =
        !this.terminoBusqueda ||
        producto.nombre.toLowerCase().includes(this.terminoBusqueda) ||
        producto.descripcion.toLowerCase().includes(this.terminoBusqueda);

      return coincideCategoria && coincideBusqueda;
    });
  }

  filtrarPorNombreCategoria(productos: Producto[], categoria: string): Producto[] {
    return productos.filter(p => this.obtenerNombreCategoria(p) === categoria);
  }

  getClaseCategoria(categoria: string): string {
    return 'cat-' + categoria.toLowerCase().replace(/\s+/g, '-');
  }

  agregarAlCarrito(producto: Producto): void {
    console.log('🛒 Agregar al carrito:', producto);
    // Aquí luego puedes integrar un servicio de carrito
  }

  getColorParaCategoria(categoria: string): string {
    let hash = 0;
    for (let i = 0; i < categoria.length; i++) {
      hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + (
      (hash & 0x00FFFFFF).toString(16).padStart(6, '0')
    );
    return color;
  }
}
