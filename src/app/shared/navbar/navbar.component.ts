import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf, NgClass, NgStyle } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    NgIf,
    NgStyle
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private cartService = inject(CartService);
  private sub!: Subscription;
  totalProductos = 0;

  ngOnInit(): void {
    this.sub = this.cartService.carrito$.subscribe(items => {
      this.totalProductos = items.reduce((acc, item) => acc + item.cantidad, 0);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  logout() {
    this.auth.logout();
  }

  nombreUsuario(): string {
    return this.auth.getNombre() || 'Usuario';
  }

  iconoPorRol(): string {
    if (this.auth.isAdmin()) return 'shield';
    if (this.auth.isVendedor()) return 'store';
    return 'person';
  }

  colorPorRol(): string {
    if (this.auth.isAdmin()) return 'gold';
    if (this.auth.isVendedor()) return '#4caf50';
    return '#2196f3';
  }

  
}
