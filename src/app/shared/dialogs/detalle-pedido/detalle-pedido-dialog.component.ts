import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../../core/order.service';

@Component({
  selector: 'app-detalle-pedido-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-pedido-dialog.component.html',
  styleUrls: ['./detalle-pedido-dialog.component.scss'],
})
export class DetallePedidoDialogComponent implements OnInit {
  pedido: Order | null = null;
  pedidoOriginal: Order | null = null;
  cargando = false;
  guardando = false;
  mensaje = '';

  constructor(
    private orderService: OrderService,
    private dialogRef: MatDialogRef<DetallePedidoDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { idPedido?: string; pedido?: Order }
  ) {}

  ngOnInit(): void {
    if (this.data.pedido) {
      this.pedido = structuredClone(this.data.pedido);
      this.pedidoOriginal = structuredClone(this.data.pedido);
    } else if (this.data.idPedido) {
      this.cargarPedido(this.data.idPedido);
    } else {
      this.mensaje = '⚠️ No se proporcionó información del pedido.';
    }
  }

  cargarPedido(id: string): void {
    this.cargando = true;
    this.orderService.getPedidosVendedor().subscribe({
      next: (pedidos) => {
        const pedidoEncontrado = pedidos.find((p) => p._id === id);
        if (pedidoEncontrado) {
          this.pedido = structuredClone(pedidoEncontrado);
          this.pedidoOriginal = structuredClone(pedidoEncontrado);
        } else {
          this.mensaje = '❌ No se encontró el pedido.';
        }
        this.cargando = false;
      },
      error: () => {
        this.mensaje = '❌ Error al cargar el pedido.';
        this.cargando = false;
      },
    });
  }

cambiarCantidad(index: number, valor: number): void {
  if (!this.pedido || !this.pedidoOriginal) return;

  const producto = this.pedido.productos[index];
  const cantidadOriginal = this.pedidoOriginal.productos[index]?.cantidad ?? 0;
  const nuevaCantidad = producto.cantidad + valor;

  // ✅ Validar que no baje de la cantidad original
  if (nuevaCantidad < cantidadOriginal) {
    this.mensaje = `⚠️ No puedes reducir por debajo de la cantidad inicial (${cantidadOriginal}).`;
    return;
  }

  // ✅ Evitar cantidades 0 o negativas por seguridad
  if (nuevaCantidad <= 0) {
    this.mensaje = '⚠️ La cantidad no puede ser menor o igual a 0.';
    return;
  }

  producto.cantidad = nuevaCantidad;
  this.calcularTotal();
}


  agregarProducto(): void {
    if (!this.pedido) return;

    const productoNuevo = {
      producto: {
        _id: 'nuevo123',
        nombre: 'Nuevo Producto',
        precio: 25000,
        imagen: 'https://via.placeholder.com/150',
      },
      cantidad: 1,
    };

    const existente = this.pedido.productos.find(
      (p) => p.producto._id === productoNuevo.producto._id
    );

    if (existente) {
      existente.cantidad++;
    } else {
      this.pedido.productos.push(productoNuevo);
    }

    this.calcularTotal();
    this.mensaje = '🟢 Producto agregado temporalmente.';
  }

  calcularTotal(): void {
    if (!this.pedido) return;
    this.pedido.total = this.pedido.productos.reduce(
      (sum, item) => sum + item.cantidad * item.producto.precio,
      0
    );
  }

  guardarCambios(): void {
    if (!this.pedido?._id || !this.pedidoOriginal) {
      this.mensaje = '❌ Pedido inválido o no cargado correctamente.';
      console.warn('❌ Pedido inválido o no cargado correctamente.', this.pedido, this.pedidoOriginal);
      return;
    }

    this.guardando = true;

    const totalOriginal = this.pedidoOriginal.total;
    const totalNuevo = this.pedido.total;
    console.log('💰 Totales -> Original:', totalOriginal, 'Nuevo:', totalNuevo);

    if (totalNuevo < totalOriginal) {
      this.mensaje = '⚠️ No puedes reducir el valor total del pedido.';
      this.guardando = false;
      console.warn('⚠️ Total menor detectado, cancelando guardado.');
      return;
    }

    const productosActualizados = this.pedido.productos.map((p) => ({
      producto: p.producto._id,
      cantidad: p.cantidad,
    }));

    const cambios: Partial<Order> = {
      estado: this.pedido.estado,
      direccion: this.pedido.direccion,
      telefono: this.pedido.telefono,
      ciudad: this.pedido.ciudad,
      indicaciones: this.pedido.indicaciones,
      total: totalNuevo,
      productos: productosActualizados as any,
    };

    console.log('📦 Cambios a enviar:', cambios);

    this.orderService.actualizarPedidoCompleto(this.pedido._id, cambios).subscribe({
      next: (response) => {
        this.guardando = false;
        console.log('✅ Respuesta del backend:', response);

        const pedidoActualizado: Order | null =
          (response as any)?.pedido || (response as any) || null;

        const excedente = Number(totalNuevo) - Number(totalOriginal);
        console.log('💵 Excedente calculado:', excedente);

        // ✅ Usar siempre el cliente original, no el vendedor actual
        const clienteData =
          (this.pedidoOriginal as any)?.usuario ||
          (this.pedidoOriginal as any)?.cliente ||
          (pedidoActualizado as any)?.usuario ||
          (pedidoActualizado as any)?.cliente ||
          null;

        console.log('👤 Cliente final detectado para checkout:', clienteData);

        const pedidoIdFinal =
          (response as any)?.pedidoId ||
          pedidoActualizado?._id ||
          this.pedido?._id ||
          '';

        console.log('🆔 Pedido final para checkout:', pedidoIdFinal);

        if (excedente > 0) {
          if (!pedidoIdFinal || isNaN(excedente) || excedente <= 0) {
            console.warn('⚠️ Datos inválidos, no se puede continuar al pago.');
            this.mensaje = '❌ No se pudo iniciar el pago. Datos inválidos.';
            this.guardando = false;
            return;
          }

          const checkoutData = {
            pedidoId: pedidoIdFinal,
            total: Number(excedente),
            cliente: clienteData,
            productos: pedidoActualizado?.productos || [],
            direccion: pedidoActualizado?.direccion || '',
            telefono: pedidoActualizado?.telefono || '',
            ciudad: pedidoActualizado?.ciudad || '',
            modo: 'excedente',
          };

          console.log('💾 CheckoutData preparado:', checkoutData);

          localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
          console.log('📍 Guardado en localStorage:', localStorage.getItem('checkoutData'));

          this.dialogRef.close(true);
          console.log('➡️ Navegando a /pago...');
          this.router.navigate(['/pago'], { state: { modo: 'excedente' } });
        } else {
          console.log('✅ Sin excedente, pedido actualizado normalmente.');
          this.mensaje = '✅ Pedido actualizado correctamente.';
          setTimeout(() => this.dialogRef.close(true), 1200);
        }
      },
      error: (err) => {
        console.error('❌ Error en el guardado:', err);
        this.mensaje = '❌ Error al guardar los cambios.';
        this.guardando = false;
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
