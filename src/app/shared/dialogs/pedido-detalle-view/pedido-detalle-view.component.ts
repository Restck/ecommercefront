import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService, Order } from '../../../core/order.service';

@Component({
  selector: 'app-pedido-detalle-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pedido-detalle-view.component.html',
  styleUrls: ['./pedido-detalle-view.component.scss']
})
export class PedidoDetalleViewComponent implements OnInit {
  pedido!: Order;
  cargando = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private dialogRef: MatDialogRef<PedidoDetalleViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pedido: Order }
  ) {}

  ngOnInit(): void {
    this.pedido = { ...this.data.pedido };
    this.cargarDetallePedido();
  }

  // 🔄 Cargar detalles actualizados desde la base de datos
  cargarDetallePedido(): void {
    if (!this.pedido._id) return;
    this.cargando = true;

    this.orderService.getPedidosVendedor().subscribe({
      next: (pedidos) => {
        const actualizado = pedidos.find(p => p._id === this.pedido._id);
        if (actualizado) this.pedido = actualizado;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando detalle del pedido', err);
        this.error = 'No se pudieron obtener los detalles del pedido.';
        this.cargando = false;
      }
    });
  }

  getSubtotal(item: any): number {
    const precio = item.producto?.precio ?? 0;
    return precio * item.cantidad;
  }

  getTotal(): number {
    return this.pedido.productos?.reduce((acc, p) => acc + this.getSubtotal(p), 0) ?? 0;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getClienteNombre(): string {
  return (
    this.pedido.nombre ||
    'No registrado'
  );
}

  getDireccionCliente(): string {
    return (
      this.pedido?.direccion ??
      'Sin dirección registrada'
    );
  }
}
