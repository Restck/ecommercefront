import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto } from '../../../core/product.service';
import { CartService } from '../../../core/cart.service';
import { AuthService } from '../../../core/auth.service';
import { ProductBreadcrumbService } from '../../../core/product-breadcrumb.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    ProductCardComponent,
    FormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  producto!: Producto;
  cargando = true;
  recomendados: Producto[] = [];
  cantidadSeleccionada = 12;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private cartService = inject(CartService);
  private breadcrumbService = inject(ProductBreadcrumbService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargando = true;
        this.productoService.getProducto(id).subscribe(data => {
          this.producto = data;
          this.cargando = false;

          if (data?.nombre) {
            this.breadcrumbService.setNombre(data.nombre);
          }
          if (data?.categoria) {
            this.breadcrumbService.setCategoria(data.categoria?.nombre);
          }

          this.cargarRecomendados(id);
        });
      }
    });
  }

  validarCantidad(): void {
    if (this.cantidadSeleccionada < 12) {
      this.cantidadSeleccionada = 12;
    }
    if (this.producto && this.cantidadSeleccionada > this.producto.stock) {
      this.cantidadSeleccionada = this.producto.stock;
    }
  }

  incrementarCantidad(): void {
    if (this.producto && this.cantidadSeleccionada < this.producto.stock) {
      this.cantidadSeleccionada++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidadSeleccionada > 12) {
      this.cantidadSeleccionada--;
    }
  }

  agregarAlCarrito(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('⚠ Debes iniciar sesión para continuar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.agregarAlCarrito(this.producto, this.cantidadSeleccionada);

    const btn = document.querySelector('.btn-carrito');
    if (btn) {
      btn.classList.add('animado');
      setTimeout(() => btn.classList.remove('animado'), 300);
    }

    this.snackBar.open(`${this.cantidadSeleccionada} unidad(es) añadida(s) al carrito`, 'Cerrar', {
      duration: 2500,
      panelClass: ['snackbar-success']
    });
  }

  comprarAhora(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('⚠ Debes iniciar sesión para continuar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.agregarAlCarrito(this.producto, this.cantidadSeleccionada);

    this.snackBar.open('Redirigiendo al checkout...', '', {
      duration: 2000,
      panelClass: ['snackbar-info']
    });

    this.router.navigate(['/checkout']);
  }

  private cargarRecomendados(idActual: string): void {
    this.productoService.getProductos().subscribe(productos => {
      this.recomendados = productos
        .filter(p => p._id !== idActual)
        .slice(0, 4);
    });
  }
}
