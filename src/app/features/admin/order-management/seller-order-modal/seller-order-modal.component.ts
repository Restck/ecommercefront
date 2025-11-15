import { Component, OnInit, Inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderService, Order } from '../../../../core/order.service';
import { ViewEncapsulation } from '@angular/core';
import { SellerOrderProductsModalComponent } from '../seller-order-products-modal/seller-order-products-modal.component';

@Component({
  selector: 'app-seller-order-modal',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-order-modal.component.html',
  styleUrls: ['./seller-order-modal.component.scss'],
})
export class SellerOrderModalComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];

  searchTerm: string = '';
  loading = true;
  errorMessage: string | null = null;
  selectedOrder: Order | null = null;

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  // 🔹 Referencia al template del modal interno (productos)
  @ViewChild('productosModal', { static: false }) productosModal?: TemplateRef<any>;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<SellerOrderModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { vendedorId: string; vendedorNombre?: string }
  ) {}

  ngOnInit(): void {
    if (this.data?.vendedorId) {
      this.cargarPedidosDeVendedor(this.data.vendedorId);
    } else {
      console.error('⚠️ No se proporcionó vendedorId al abrir el modal.');
      this.errorMessage = 'No se encontró el identificador del vendedor.';
      this.loading = false;
    }
  }

  /** 🔹 Carga los pedidos asociados al vendedor */
  private cargarPedidosDeVendedor(vendedorId: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.orderService.getPedidosPorVendedorAdmin(vendedorId).subscribe({
      next: (data) => {
        this.orders = data || [];
        this.filteredOrders = [...this.orders];
        this.loading = false;
        this.actualizarPaginacion();
      },
      error: (err) => {
        console.error('❌ Error al cargar pedidos del vendedor:', err);
        this.errorMessage = 'Error al obtener los pedidos del vendedor.';
        this.loading = false;
      },
    });
  }

  /** 🔹 Filtra los pedidos según el término de búsqueda */
  filtrarPedidos(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter((order) =>
        (order._id?.toLowerCase().includes(term) ||
          order.nombre?.toLowerCase().includes(term) ||
          order.estado?.toLowerCase().includes(term))
      );
    }
    this.currentPage = 1;
    this.actualizarPaginacion();
  }

  /** 🔹 Actualiza la lista paginada */
  actualizarPaginacion(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage) || 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(start, end);
  }

  /** 🔹 Cambia la página actual */
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.actualizarPaginacion();
    }
  }

  /** 🔹 Cambia el estado de un pedido */
  cambiarEstado(orderId: string | undefined, nuevoEstado: Order['estado']): void {
    if (!orderId || !nuevoEstado) {
      console.warn('⚠️ Pedido sin ID válido o estado no definido.');
      return;
    }

    this.orderService.actualizarEstadoPedido(orderId, nuevoEstado).subscribe({
      next: () => this.cargarPedidosDeVendedor(this.data.vendedorId),
      error: (err) => {
        console.error('❌ Error al actualizar estado:', err);
        this.errorMessage = 'No se pudo actualizar el estado del pedido.';
      },
    });
  }

  /** 🔹 Abre modal con los productos del pedido */
abrirProductosModal(order: any) {
  this.dialog.open(SellerOrderProductsModalComponent, {
    width: '600px',
    data: { order },
  });
}

  /** 🔹 Cierra el modal principal */
  cerrarModal(): void {
    this.dialogRef.close();
  }
}
