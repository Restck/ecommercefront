import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/* 🧾 Modal personalizado para ver detalles del pedido */
@Component({
  selector: 'pedido-cliente-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>receipt_long</mat-icon> Detalles del Pedido
    </h2>

    <mat-dialog-content class="contenido">
      <!-- Info básica -->
      <section class="seccion">
        <h3><mat-icon>info</mat-icon> Información del pedido</h3>
        <p><strong>ID:</strong> {{ data._id }}</p>
        <p><strong>Fecha:</strong> {{ data.fecha | date:'fullDate' }}</p>
        <p><strong>Total:</strong> {{ data.total | currency:'COP':'symbol' }}</p>
        <p><strong>Estado:</strong> {{ data.estado }}</p>
      </section>

      <!-- Productos -->
      <section class="seccion" *ngIf="data.productos?.length">
        <h3><mat-icon>inventory_2</mat-icon> Productos</h3>
        <div class="productos-grid">
          <div class="producto-card" *ngFor="let item of data.productos">
            <img [src]="item.producto.imagen" alt="Producto" class="producto-img" />
            <div class="producto-info">
              <h4>{{ item.producto.nombre }}</h4>
              <p>Cantidad: {{ item.cantidad }}</p>
              <p>Precio: {{ item.producto.precio | currency:'COP':'symbol' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Comprobante -->
      <section class="seccion" *ngIf="data.comprobantePago">
        <h3><mat-icon>receipt</mat-icon> Comprobante de Pago</h3>
        <img [src]="data.comprobantePago" alt="Comprobante" class="comprobante-img" />
        <a [href]="data.comprobantePago" target="_blank" rel="noopener" class="comprobante-link">
          <mat-icon>open_in_new</mat-icon> Ver en nueva pestaña
        </a>
      </section>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    ::ng-deep .mat-dialog-container {
      max-width: 900px !important;
      width: 100%;
      padding: 2rem;
    }

    .contenido {
      padding: 1rem;

      .seccion {
        margin-bottom: 1.5rem;

        h3 {
          font-size: 1rem;
          color: #3f51b5;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.95rem;
          margin: 0.3rem 0;
        }

        .productos-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .producto-card {
          display: flex;
          gap: 1rem;
          background-color: #f5f5f5;
          border-radius: 10px;
          padding: 1rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          align-items: center;

          .producto-img {
            width: 90px;
            height: 90px;
            object-fit: cover;
            border-radius: 8px;
          }

          .producto-info {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;

            h4 {
              margin: 0;
              font-size: 1rem;
              color: #333;
            }

            p {
              margin: 0;
              font-size: 0.9rem;
              color: #555;
            }
          }
        }

        .comprobante-img {
          max-width: 100%;
          margin-top: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .comprobante-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #3f51b5;
          text-decoration: none;
        }
      }
    }
  `]
})
export class PedidoClienteDetalleDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PedidoClienteDetalleDialog>
  ) {}
}

/* 📦 Lista de pedidos del cliente */
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  pedidos: any[] = [];
  cargando = true;

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:5000/api/ordenes/mis', { headers }).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
        console.log('🧾 Pedidos del cliente:', this.pedidos);
      },
      error: (err) => {
        console.error('❌ Error al cargar pedidos:', err);
        this.cargando = false;
      }
    });
  }

  verDetalle(pedido: any): void {
    this.dialog.open(PedidoClienteDetalleDialog, {
      width: '900px',
      data: pedido
    });
  }
}
