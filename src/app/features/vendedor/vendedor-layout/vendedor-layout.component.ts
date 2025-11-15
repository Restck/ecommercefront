import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-vendedor-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule, // Necesario para routerLink y routerLinkActive
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vendedor-layout.component.html',
  styleUrls: ['./vendedor-layout.component.scss']
})
export class VendedorLayoutComponent {
  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
