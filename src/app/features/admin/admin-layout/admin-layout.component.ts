import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, RouterOutlet, MatDividerModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  pedidosMenuAbierto = false;
  tipoUsuario: 'admin' | 'vendedor' | 'cliente' = 'admin';

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    const usuario = this.obtenerUsuarioDesdeToken();
    if (usuario?.rol === 'vendedor') this.tipoUsuario = 'vendedor';
    else if (usuario?.rol === 'cliente') this.tipoUsuario = 'cliente';
    else this.tipoUsuario = 'admin';
  }

  /** 🔽 Alterna el menú desplegable de "Pedidos" */
  togglePedidosMenu(): void {
    this.pedidosMenuAbierto = !this.pedidosMenuAbierto;
  }

  /** 🔍 Decodifica el token JWT para obtener los datos del usuario logueado */
  private obtenerUsuarioDesdeToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      // Ajusta esta línea según tu backend (por ejemplo, payload.usuario o payload.user)
      return payload?.usuario || payload?.user || payload;
    } catch (error) {
      console.error('❌ Error al decodificar el token:', error);
      return null;
    }
  }
}
