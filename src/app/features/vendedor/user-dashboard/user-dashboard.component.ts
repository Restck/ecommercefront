import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { OrderService } from '../../../core/order.service';
import { ProductoService } from '../../../core/product.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  metrics: any[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.loading = true;

    forkJoin({
      orders: this.orderService.getPedidosVendedor(),
      productos: this.productoService.getProductos()
    })
      .pipe(
        map(({ orders, productos }: any) => {
          // 🧮 Contadores por estado
          const pendientes = orders.filter((o: any) => o.estado === 'pendiente').length;
          const verificados = orders.filter((o: any) => o.estado === 'verificado').length;
          const enviados = orders.filter((o: any) => o.estado === 'enviado').length;
          const completados = orders.filter((o: any) => o.estado === 'entregado').length;

          // 💰 Total de ingresos (solo pedidos entregados)
          const totalIngresos = orders
            .filter((o: any) => o.estado === 'entregado')
            .reduce((acc: number, o: any) => acc + o.total, 0);

          // 🧾 Métricas para el dashboard
          return [
            {
              title: 'Pedidos pendientes',
              value: pendientes,
              icon: 'lock_clock',
              color: '#ff9800',
              bgColor: '#fff4e5'
            },
            {
              title: 'Pedidos verificados',
              value: verificados,
              icon: 'rule',
              color: '#1e88e5',
              bgColor: '#e7f2ff'
            },
            {
              title: 'Pedidos enviados',
              value: enviados,
              icon: 'local_shipping',
              color: '#00acc1',
              bgColor: '#e0f7fa'
            },
            {
              title: 'Pedidos completados',
              value: completados,
              icon: 'done_all',
              color: '#43a047',
              bgColor: '#e8f5e9'
            },
            {
              title: 'Productos publicados',
              value: productos.length,
              icon: 'inventory_2',
              color: '#1976d2',
              bgColor: '#e3f2fd'
            },
            {
              title: 'Ingresos totales',
              value: `$${totalIngresos.toLocaleString()}`,
              icon: 'attach_money',
              color: '#2e7d32',
              bgColor: '#e8f5e9'
            }
          ];
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (metrics) => (this.metrics = metrics),
        error: (err) => console.error('Error cargando métricas', err)
      });
  }
}
