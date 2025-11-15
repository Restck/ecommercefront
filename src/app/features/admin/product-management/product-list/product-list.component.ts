import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../../../../core/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, AfterViewInit {

  private productoService = inject(ProductoService);
  private router = inject(Router);

  displayedColumns: string[] = ['imagen', 'nombre', 'categoria', 'precio', 'stock', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.cargarProductos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        const data = productos.map(p => ({
          ...p,
          categoriaNombre: p.categoria?.nombre ?? 'Sin categoría'
        }));
        this.dataSource.data = data;
      },
      error: () => alert('Error al cargar productos'),
    });
  }

  filtrar(event: Event) {
    const valor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = valor;
  }

  editar(id: string) {
    this.router.navigate(['/admin/productos/editar', id]);
  }

  eliminar(id: string) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          alert('Producto eliminado');
          this.cargarProductos();
        },
        error: () => alert('Error al eliminar producto'),
      });
    }
  }

  crear() {
    this.router.navigate(['/admin/productos/nuevo']);
  }
}
