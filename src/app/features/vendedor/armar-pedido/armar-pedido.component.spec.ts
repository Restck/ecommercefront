import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  imagen?: string;
  categoriaId?: string;
}

interface CarritoItem {
  _id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-armar-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './armar-pedido.component.html',
  styleUrls: ['./armar-pedido.component.scss']
})
export class ArmarPedidoComponent {
  productos: Producto[] = [
    { _id: '1', nombre: 'Producto 1', precio: 20000, imagen: 'https://via.placeholder.com/150', categoriaId: 'cat1' },
    { _id: '2', nombre: 'Producto 2', precio: 35000, imagen: 'https://via.placeholder.com/150', categoriaId: 'cat2' }
  ];
  categorias = [
    { _id: 'cat1', nombre: 'Electrónica' },
    { _id: 'cat2', nombre: 'Ropa' }
  ];

  carrito: CarritoItem[] = [];
  buscador: string = '';
  categoriaSeleccionada: string = '';
  mostrarModal: boolean = false;

  // Campos del formulario
  nombre: string = '';
  telefono: string = '';
  ciudad: string = '';
  direccion: string = '';
  metodoPago: string = 'Nequi'; // 🔒 Solo Nequi

  get productosFiltrados(): Producto[] {
    return this.productos.filter(p =>
      (!this.buscador || p.nombre.toLowerCase().includes(this.buscador.toLowerCase())) &&
      (!this.categoriaSeleccionada || p.categoriaId === this.categoriaSeleccionada)
    );
  }

  get total(): number {
    return this.carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  agregarAlCarrito(p: Producto) {
    const item = this.carrito.find(i => i._id === p._id);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ ...p, cantidad: 1 });
    }
  }

  cambiarCantidad(item: CarritoItem, event: any) {
    const value = parseInt(event.target.value, 10);
    item.cantidad = value > 0 ? value : 1;
  }

  eliminar(item: CarritoItem) {
    this.carrito = this.carrito.filter(i => i._id !== item._id);
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  confirmarPedido() {
    if (!this.nombre || !this.telefono || !this.ciudad || !this.direccion) {
      alert('Por favor completa todos los campos');
      return;
    }

    const pedido = {
      cliente: {
        nombre: this.nombre,
        telefono: this.telefono,
        ciudad: this.ciudad,
        direccion: this.direccion
      },
      metodoPago: this.metodoPago,
      productos: this.carrito,
      total: this.total
    };

    console.log('Pedido confirmado:', pedido);

    alert('✅ Pedido enviado con éxito por Nequi');
    this.carrito = [];
    this.cerrarModal();
  }
}
