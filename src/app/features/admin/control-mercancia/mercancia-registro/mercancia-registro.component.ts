import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService, Producto } from '../../../../core/product.service';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-mercancia-registro',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatSpinner
  ],
  templateUrl: './mercancia-registro.component.html',
  styleUrls: ['./mercancia-registro.component.scss']
})
export class MercanciaRegistroComponent implements OnInit, OnChanges {

  /** 🔹 Si el padre pone recargar = true, se vuelven a pedir los datos */
  @Input() recargar!: boolean;

  // 🔹 Se agregan las nuevas columnas
  displayedColumns: string[] = [
    'producto',
    'categoria',
    'proveedor',
    'cantidadBodega',
    'cantidadStock',
    'cantidadMover',
    'acciones'
  ];

  dataSource = new MatTableDataSource<any>([]);
  formularios: { [key: string]: FormGroup } = {};
  cargando = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarMercancia();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recargar'] && this.recargar) {
      this.cargarMercancia();
    }
  }

  cargarMercancia() {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (productos: Producto[]) => {
        const lista = Array.isArray(productos) ? productos : [];

        // 🔹 Mapeamos también categoría y proveedor
        const mercancia = lista.map((p) => ({
          id: p._id ?? '',
          producto: p.nombre ?? '',
          categoria: (p as any).categoria?.nombre ?? 'Sin categoría',
          proveedor: (p as any).proveedor?.nombre ?? 'Sin proveedor',
          cantidadBodega: Number((p as any).cantidadBodega ?? 0),
          cantidadStock: Number(p.stock ?? 0)
        }));

        // 🔹 Crear formularios dinámicos
        mercancia.forEach(item => {
          this.formularios[item.id] = this.fb.group({
            cantidadMover: [1, [Validators.required, Validators.min(1)]]
          });
        });

        this.dataSource.data = mercancia;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando mercancía', err);
        this.cargando = false;
        this.dataSource.data = [];
      }
    });
  }

  aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  moverABodega(item: any) {
    this.moverProducto(item, 'bodega', 'stock');
  }

  moverAStock(item: any) {
    this.moverProducto(item, 'stock', 'bodega');
  }

  private moverProducto(item: any, bodegaDestino: string, bodegaOrigen: string) {
    const form = this.formularios[item.id];
    if (!form || form.invalid) return;

    const cantidad = Number(form.value.cantidadMover);

    if (bodegaDestino === 'bodega' && cantidad > item.cantidadStock) {
      alert('❌ Cantidad superior a la disponible en Stock');
      return;
    }
    if (bodegaDestino === 'stock' && cantidad > item.cantidadBodega) {
      alert('❌ Cantidad superior a la disponible en Bodega');
      return;
    }

    this.productoService.registrarMovimiento(item.id, {
      tipo: 'traslado',
      cantidad,
      bodegaOrigen,
      bodegaDestino,
      observaciones: `Movido ${cantidad} de ${bodegaOrigen} a ${bodegaDestino}`
    }).subscribe({
      next: () => {
        if (bodegaDestino === 'bodega') {
          item.cantidadBodega += cantidad;
          item.cantidadStock -= cantidad;
        } else {
          item.cantidadBodega -= cantidad;
          item.cantidadStock += cantidad;
        }
        form.reset({ cantidadMover: 1 });
        console.log(`✅ Movido ${cantidad} de ${item.producto} (${bodegaOrigen} → ${bodegaDestino})`);
      },
      error: (err) => console.error(`❌ Error moviendo producto (${bodegaOrigen} → ${bodegaDestino})`, err)
    });
  }
}
