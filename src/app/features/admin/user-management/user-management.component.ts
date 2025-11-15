import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UsuarioService, Usuario } from '../../../core/usuario.service';

type RolUsuario = 'admin' | 'cliente' | 'vendedor';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  private usuarioService = inject(UsuarioService);

  displayedColumns: string[] = ['nombre', 'correo', 'rol'];

  clientesDataSource = new MatTableDataSource<Usuario>([]);
  vendedoresDataSource = new MatTableDataSource<Usuario>([]);

  @ViewChild('clientesPaginator') clientesPaginator?: MatPaginator;
  @ViewChild('vendedoresPaginator') vendedoresPaginator?: MatPaginator;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit(): void {
    if (this.clientesPaginator) {
      this.clientesDataSource.paginator = this.clientesPaginator;
    }
    if (this.vendedoresPaginator) {
      this.vendedoresDataSource.paginator = this.vendedoresPaginator;
    }
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe(usuarios => {
      this.clientesDataSource.data = usuarios.filter(u => u.rol === 'cliente');
      this.vendedoresDataSource.data = usuarios.filter(u => u.rol === 'vendedor');
    });
  }

  aplicarFiltro(valor: string, tipo: string): void {
    const filtro = valor.trim().toLowerCase();

    if (tipo === 'cliente') {
      this.clientesDataSource.filterPredicate = (data: Usuario, filter: string) =>
        data.nombre.toLowerCase().includes(filter) || data.correo.toLowerCase().includes(filter);
      this.clientesDataSource.filter = filtro;
      if (this.clientesDataSource.paginator) {
        this.clientesDataSource.paginator.firstPage();
      }
    } else if (tipo === 'vendedor') {
      this.vendedoresDataSource.filterPredicate = (data: Usuario, filter: string) =>
        data.nombre.toLowerCase().includes(filter) || data.correo.toLowerCase().includes(filter);
      this.vendedoresDataSource.filter = filtro;
      if (this.vendedoresDataSource.paginator) {
        this.vendedoresDataSource.paginator.firstPage();
      }
    }
  }

  actualizarRol(usuario: Usuario, nuevoRol: string): void {
    const rolValido = nuevoRol as RolUsuario;

    if (usuario.rol !== rolValido) {
      this.usuarioService.actualizarRol(usuario._id, rolValido).subscribe({
        next: () => {
          usuario.rol = rolValido;
          this.cargarUsuarios();
        },
        error: () => {
          alert('Error al actualizar el rol');
        }
      });
    }
  }
}
