import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../core/order.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DetallePedidoDialogComponent } from '../../../shared/dialogs/detalle-pedido/detalle-pedido-dialog.component';
import { PedidoDetalleViewComponent } from '../../../shared/dialogs/pedido-detalle-view/pedido-detalle-view.component';

@Component({
  selector: 'app-pedidos-en-espera',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './pedidos-en-espera.component.html',
  styleUrls: ['./pedidos-en-espera.component.scss']
})
export class PedidosEnEsperaComponent implements OnInit, AfterViewInit {
  pedidos: Order[] = [];
  dataSource = new MatTableDataSource<Order>([]);
  displayedColumns: string[] = ['cliente', 'productos', 'total', 'estado', 'acciones'];
  cargando = false;
  error: string | null = null;
  filtro: string = '';

  deletingId: string | null = null;

  estadosDisponibles: Array<'pendiente' | 'verificado' | 'rechazado' | 'enviado'> = [
    'pendiente',
    'verificado',
    'rechazado',
    'enviado'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private orderService: OrderService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  ngAfterViewInit(): void {
    this.attachDataSource();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = null;

    this.orderService.getPedidosVendedor().subscribe({
      next: (data) => {
        this.pedidos = data || [];
        this.dataSource = new MatTableDataSource(this.pedidos);
        this.attachDataSource();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.error = 'No se pudieron cargar los pedidos';
        this.cargando = false;
      }
    });
  }

  private attachDataSource() {
    if (!this.dataSource) return;
    this.dataSource.filterPredicate = (pedido: Order, filtro: string) => {
      filtro = (filtro || '').toLowerCase();
      const cliente = (pedido.usuario?.nombre || pedido.nombre || '').toLowerCase();
      const estado = (pedido.estado || '').toLowerCase();
      const total = (pedido.total != null ? pedido.total.toString() : '').toLowerCase();
      return cliente.includes(filtro) || estado.includes(filtro) || total.includes(filtro);
    };
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  limpiarFiltro(): void {
    this.dataSource.filter = '';
  }

getClienteNombre(pedido: Order): string {
  return `${pedido.nombre || 'Cliente sin nombre'}`;
}

  getProductosResumen(pedido: Order): string {
    return pedido.productos
      .map(p => `${p.producto?.nombre} (x${p.cantidad})`)
      .join(', ');
  }

// 👁‍🗨 Ver detalles del pedido (modal solo lectura)
verDetallesPedido(pedido: Order): void {
  this.dialog.open(PedidoDetalleViewComponent, {
    width: '1200px',          // 🔹 Más ancho en pantallas grandes
    maxWidth: '95vw',         // 🔹 No se sale del viewport
    maxHeight: '90vh',        // 🔹 Si hay mucho contenido, aparece scroll
    panelClass: 'custom-wide-dialog', // 🔹 Clase personalizada opcional
    data: { pedido }
  });
}

// ✏️ Editar pedido
editarPedido(pedido: Order): void {
  const dialogRef = this.dialog.open(DetallePedidoDialogComponent, {
    width: '1200px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    panelClass: 'custom-wide-dialog',
    data: { pedido, modo: 'editar' }
  });

  dialogRef.afterClosed().subscribe((actualizado) => {
    if (actualizado) {
      this.cargarPedidos();
    }
  });
}


  // 🗑️ Eliminar pedido
  eliminarPedido(pedido: Order): void {
    const id = pedido._id;
    if (!id) {
      alert('Pedido inválido (falta id).');
      return;
    }

    const confirmar = confirm(`¿Seguro que deseas eliminar el pedido de ${this.getClienteNombre(pedido)}?`);
    if (!confirmar) return;

    this.deletingId = id;

    this.orderService.eliminarPedido(id).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(p => p._id !== id);
        this.dataSource.data = this.pedidos;
        (this.dataSource as any)._updateChangeSubscription?.();
        this.deletingId = null;
        alert('Pedido eliminado correctamente.');
      },
      error: (err) => {
        console.error('Error eliminando pedido', err);
        this.deletingId = null;
        alert('No se pudo eliminar el pedido. Revisa la consola.');
      }
    });
  }

  // 🔄 Cambiar estado del pedido
  actualizarEstadoPedido(pedido: Order, nuevoEstado: 'pendiente' | 'verificado' | 'rechazado' | 'enviado'): void {
    if (!pedido._id) return;
    this.orderService.actualizarEstadoPedido(pedido._id, nuevoEstado).subscribe({
      next: () => {
        pedido.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error actualizando estado', err);
        alert('❌ No se pudo actualizar el estado');
      }
    });
  }
}
