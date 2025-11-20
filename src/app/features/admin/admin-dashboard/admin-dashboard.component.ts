import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { timer, switchMap } from 'rxjs';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';


interface DashboardStats {
  productos: number;
  usuarios: number;
  pedidos: number;
  ingresos: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  animations: [
    trigger('cardAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class AdminDashboardComponent implements OnInit {
  productos = 0;
  pedidos = 0;
  usuarios = 0;
  ingresos = 0;

  // 🔥 Ruta corregida
  private apiUrl = `${environment.apiUrl}/api/dashboard`;


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    timer(0, 15000)
      .pipe(switchMap(() => this.http.get<DashboardStats>(this.apiUrl)))
      .subscribe((data) => {
        this.animate('productos', data.productos, 400);
        this.animate('pedidos', data.pedidos, 400);
        this.animate('usuarios', data.usuarios, 400);
        this.animate('ingresos', data.ingresos, 600);
      });
  }

  animate(prop: keyof AdminDashboardComponent, target: number, duration: number) {
    const start = (this as any)[prop] || 0;
    const range = target - start;
    const frameRate = 10;
    const steps = duration / frameRate;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const value = Math.round(start + (range * step) / steps);
      (this as any)[prop] = value;

      if (step >= steps) {
        (this as any)[prop] = target;
        clearInterval(interval);
      }
    }, frameRate);
  }

  formatCurrency(value: number): string {
    if (!value || isNaN(value)) return '$0.0M COP';
    const millones = value / 1_000_000;
    return `$${millones.toFixed(1)}M COP`;
  }
}
