import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClienteOrdersModalComponent } from './cliente-orders-modal/cliente-orders-modal.component';
import { SellerOrderModalComponent } from './seller-order-modal/seller-order-modal.component';

interface UsuarioStats {
  _id: string;
  nombre: string;
  correo: string;
  ciudad?: string;
  telefono?: string;
  cantidadPedidos?: number;
  totalComprado?: number;
  totalVendido?: number;
}

interface PedidoVendedor {
  _id: string;
  clienteNombre: string;
  estado: string;
  fecha: string;
  total: number;
}

@Component({
  selector: 'app-order-management',
  standalone: true,
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
})
export class OrderManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  tipoUsuario: 'admin' | 'cliente' | 'vendedor' = 'admin';
  tipoVista: 'cliente' | 'vendedor' = 'cliente';

  clientes: UsuarioStats[] = [];
  vendedores: UsuarioStats[] = [];
  pedidosVendedor: PedidoVendedor[] = [];

  filtroCliente = '';
  filtroVendedor = '';
  filtroActual = '';

  displayedColumnsCliente: string[] = [
    'nombre',
    'correo',
    'ciudad',
    'telefono',
    'cantidadPedidos',
    'totalComprado',
    'acciones',
  ];

  displayedColumnsVendedor: string[] = [
    'nombre',
    'correo',
    'telefono',
    'cantidadPedidos',
    'totalVendido',
    'acciones',
  ];

  displayedColumnsPedidosVendedor: string[] = [
    'clienteNombre',
    'estado',
    'fecha',
    'total',
    'acciones',
  ];

  ngOnInit(): void {
    const usuario = this.obtenerUsuarioDesdeToken();

    if (usuario?.rol === 'vendedor') {
      this.tipoUsuario = 'vendedor';
      this.tipoVista = 'vendedor';
      this.cargarPedidosVendedor(); // ✅ solo sus pedidos
    } else if (usuario?.rol === 'cliente') {
      this.tipoUsuario = 'cliente';
      this.tipoVista = 'cliente';
      this.cargarClientes();
    } else {
      this.tipoUsuario = 'admin';
      this.route.queryParams.subscribe((params) => {
        const tipo = params['tipo'];
        this.tipoVista = tipo === 'vendedor' ? 'vendedor' : 'cliente';
        this.cargarDatos();
      });
    }

    this.filtroActual =
      this.tipoVista === 'cliente' ? this.filtroCliente : this.filtroVendedor;
  }

  actualizarFiltro(): void {
    if (this.tipoVista === 'cliente') {
      this.filtroCliente = this.filtroActual;
    } else {
      this.filtroVendedor = this.filtroActual;
    }
  }

  private obtenerUsuarioDesdeToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload?.usuario || payload?.user || payload;
    } catch (error) {
      console.error('❌ Error al decodificar token:', error);
      return null;
    }
  }

  private cargarDatos(): void {
    if (this.tipoVista === 'cliente') this.cargarClientes();
    else this.cargarVendedores();
  }

  // 🔹 CLIENTES
  cargarClientes(): void {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    this.http
      .get<UsuarioStats[]>(
        'http://localhost:5000/api/usuarios/estadisticas/clientes',
        { headers }
      )
      .subscribe({
        next: (data) => (this.clientes = data),
        error: (err) => console.error('❌ Error al cargar clientes', err),
      });
  }

  // 🔹 VENDEDORES
  cargarVendedores(): void {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    this.http
      .get<UsuarioStats[]>(
        'http://localhost:5000/api/usuarios/estadisticas/vendedores',
        { headers }
      )
      .subscribe({
        next: (data) => (this.vendedores = data),
        error: (err) => console.error('❌ Error al cargar vendedores', err),
      });
  }

  // 🔹 PEDIDOS DEL VENDEDOR LOGUEADO
  cargarPedidosVendedor(): void {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    this.http
      .get<PedidoVendedor[]>(
        'http://localhost:5000/api/order/mis-pedidos',
        { headers }
      )
      .subscribe({
        next: (data) => (this.pedidosVendedor = data),
        error: (err) =>
          console.error('❌ Error al cargar pedidos del vendedor', err),
      });
  }

  // 🔍 FILTROS
  clientesFiltrados(): UsuarioStats[] {
    const t = this.filtroCliente.toLowerCase().trim();
    return this.clientes.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(t) ||
        c.correo?.toLowerCase().includes(t)
    );
  }

  vendedoresFiltrados(): UsuarioStats[] {
    const t = this.filtroVendedor.toLowerCase().trim();
    return this.vendedores.filter(
      (v) =>
        v.nombre?.toLowerCase().includes(t) ||
        v.correo?.toLowerCase().includes(t)
    );
  }

  limpiarFiltro(): void {
    this.filtroActual = '';
    this.filtroCliente = '';
    this.filtroVendedor = '';
  }

  // 🔹 ABRIR MODALES SEGÚN TIPO DE VISTA
  abrirPedidos(usuario: UsuarioStats): void {
    const data =
      this.tipoVista === 'cliente'
        ? { clienteId: usuario._id }
        : { vendedorId: usuario._id };

    if (this.tipoVista === 'vendedor') {
      // 🔹 Modal del vendedor
      this.dialog.open(SellerOrderModalComponent, {
        maxWidth: '95vw',
        width: '95vw',
        maxHeight: '90vh',
        autoFocus: false,
        panelClass: 'vendedor-pedidos-dialog',
        data,
      });
    } else {
      // 🔹 Modal del cliente
      this.dialog.open(ClienteOrdersModalComponent, {
        maxWidth: '95vw',
        width: '95vw',
        maxHeight: '90vh',
        autoFocus: false,
        panelClass: 'cliente-pedidos-dialog',
        data,
      });
    }
  }
}
