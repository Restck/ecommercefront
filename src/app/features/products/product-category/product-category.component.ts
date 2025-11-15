import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductoService, Producto } from '../../../core/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductBreadcrumbService } from '../../../core/product-breadcrumb.service';

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss']
})
export class ProductCategoryComponent implements OnInit {
  productosFiltrados: Producto[] = [];
  categoriaUrl = '';
  cargando = true;

  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private breadcrumbService = inject(ProductBreadcrumbService); // ✅ Inyectar servicio

  ngOnInit(): void {
    this.categoriaUrl = this.route.snapshot.paramMap.get('nombre') || '';

    // ✅ Establecer breadcrumb dinámico con primera letra mayúscula
    const capitalizado = this.categoriaUrl.charAt(0).toUpperCase() + this.categoriaUrl.slice(1);
    this.breadcrumbService.setNombre(capitalizado);

    this.productoService.getProductos().subscribe(productos => {
      this.productosFiltrados = productos.filter(p => {
        const nombreCategoria = typeof p.categoria === 'string'
          ? p.categoria
          : p.categoria?.nombre;

        return nombreCategoria?.toLowerCase() === this.categoriaUrl.toLowerCase();
      });

      this.cargando = false;
      console.log('🧠 Productos filtrados por categoría:', this.productosFiltrados);
    });
  }
}
