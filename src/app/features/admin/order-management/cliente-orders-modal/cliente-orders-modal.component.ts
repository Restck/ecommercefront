import { Component, Input, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../../core/order.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';

type PedidoExtendido = Order & {
  estadoOriginal: string;
  estadoComprobanteOriginal: string;
};

@Component({
  selector: 'app-cliente-orders-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './cliente-orders-modal.component.html',
  styleUrl: './cliente-orders-modal.component.scss'
})
export class ClienteOrdersModalComponent implements OnInit {

  columnas: string[] = ['fecha', 'total', 'estado', 'estadoComprobante', 'comprobante', 'acciones'];
  pedidos: PedidoExtendido[] = [];
  pedidosFiltrados: PedidoExtendido[] = [];

  pageSize = 5;
  currentPage = 0;
  searchText = '';

  estadosPedido = ['pendiente', 'verificado', 'rechazado', 'enviado'];
  estadosComprobante = ['pendiente', 'aprobado', 'rechazado'];

  constructor(
    private orderService: OrderService,
    @Inject(MAT_DIALOG_DATA) public data: { clienteId: string },
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log('ID del cliente recibido:', this.data?.clienteId);
    if (this.data?.clienteId) {
      this.cargarPedidosCliente(this.data.clienteId);
    }
  }

  cargarPedidosCliente(clienteId: string): void {
    this.orderService.getPedidosPorCliente(clienteId).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos.map(p => ({
          ...p,
          estado: p.estado || 'pendiente',
          estadoOriginal: p.estado || 'pendiente',
          estadoComprobante: p.estadoComprobante || 'pendiente',
          estadoComprobanteOriginal: p.estadoComprobante || 'pendiente'
        }));
        this.pedidosFiltrados = [...this.pedidos];
      },
      error: (err) => {
        console.error('Error cargando pedidos del cliente:', err);
      }
    });
  }

  // ================================
  //  URL CORRECTA DEL COMPROBANTE
  // ================================
  getComprobanteUrl(order: Order): string {
    if (!order?.comprobante) return '';

    // Si ya viene una URL completa
    if (order.comprobante.startsWith('http')) return order.comprobante;

    // Concatenar con backend
    return `http://localhost:5000${order.comprobante}`;
  }

  // ================================
  //  GUARDAR ESTADOS
  // ================================
  guardarEstados(pedido: PedidoExtendido): void {
    if (!pedido._id) return;

    const actualizaciones: Promise<any>[] = [];

    if (pedido.estado !== pedido.estadoOriginal) {
      actualizaciones.push(new Promise((resolve, reject) => {
        this.orderService.actualizarEstadoPedido(pedido._id!, pedido.estado).subscribe({
          next: () => {
            pedido.estadoOriginal = pedido.estado;
            console.log('✅ Estado del pedido actualizado');
            resolve(true);
          },
          error: (err) => {
            console.error('❌ Error al actualizar estado del pedido:', err);
            reject(err);
          }
        });
      }));
    }

    if (pedido.estadoComprobante !== pedido.estadoComprobanteOriginal) {
      const estadoComp = pedido.estadoComprobante ?? 'pendiente';
      actualizaciones.push(new Promise((resolve, reject) => {
        this.orderService.actualizarEstadoComprobante(pedido._id!, estadoComp).subscribe({
          next: () => {
            pedido.estadoComprobanteOriginal = estadoComp;
            console.log('✅ Estado del comprobante actualizado');
            resolve(true);
          },
          error: (err) => {
            console.error('❌ Error al actualizar estado del comprobante:', err);
            reject(err);
          }
        });
      }));
    }

    if (actualizaciones.length === 0) {
      console.log('ℹ️ No hay cambios para guardar.');
      return;
    }

    Promise.all(actualizaciones)
      .then(() => console.log('✅ Todos los cambios guardados.'))
      .catch(() => console.warn('⚠️ Algunos cambios no se pudieron guardar.'));
  }

  // ================================
  //  FILTRO
  // ================================
  filtrarPedidos(): void {
    const text = this.searchText.toLowerCase();
    this.pedidosFiltrados = this.pedidos.filter(p =>
      (p.estadoComprobante?.toLowerCase().includes(text) ?? false) ||
      (p.estado?.toLowerCase().includes(text) ?? false) ||
      (p.fecha && new Date(p.fecha).toLocaleDateString().includes(text)) ||
      p.total.toString().includes(text)
    );
    this.currentPage = 0;
  }

  get pagedPedidos(): PedidoExtendido[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.pedidosFiltrados.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  verDetalles(pedidoId: string): void {
    console.log('Ver detalles del pedido:', pedidoId);
  }

  // ================================
  // ABRIR / DESCARGAR COMPROBANTE
  // ================================
  descargarComprobante(pedido: Order) {
    const url = this.getComprobanteUrl(pedido);
    if (url) window.open(url, '_blank');
  }

  abrirComprobante(order: Order): void {
    const url = this.getComprobanteUrl(order);
    if (url) window.open(url, '_blank');
  }

  verPedido(pedido: any): void {
    this.dialog.open(OrderSummaryComponent, {
      data: { pedido },
      width: '600px'
    });
  }
}
