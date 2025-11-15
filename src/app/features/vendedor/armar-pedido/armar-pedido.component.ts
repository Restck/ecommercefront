import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ProductoService, Categoria, Producto } from '../../../core/product.service';
import { OrderService } from '../../../core/order.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

interface ProductoConStock extends Producto {
  stock: number;
}

interface CarritoItem extends ProductoConStock {
  cantidad: number;
}

@Component({
  selector: 'app-armar-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './armar-pedido.component.html',
  styleUrls: ['./armar-pedido.component.scss']
})
export class ArmarPedidoComponent implements OnInit {
  productos: ProductoConStock[] = [];
  carrito: CarritoItem[] = [];
  total = 0;
  loading = true;

  // 🧾 Datos del cliente
  nombre = '';
  telefono = '';
  ciudad = '';
  direccion = '';
  indicaciones = '';

  // 🎯 Filtros
  categorias: Categoria[] = [];
  categoriaSeleccionada = '';
  buscador = '';

  // 🪟 Modal
  mostrarModal = false;

  constructor(
    private productoService: ProductoService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    // 🔹 Cargar productos con stock
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.map((p) => ({
          ...p,
          stock: (p as any).stock ?? 0
        }));
        this.loading = false;
      },
      error: () => (this.loading = false)
    });

    // 🔹 Cargar categorías
    this.productoService.getCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('❌ Error al cargar categorías', err)
    });
  }

  /** 🔎 Filtrar productos */
  get productosFiltrados(): ProductoConStock[] {
    return this.productos.filter((p) => {
      const coincideBusqueda = this.buscador
        ? p.nombre.toLowerCase().includes(this.buscador.toLowerCase())
        : true;
      const coincideCategoria = this.categoriaSeleccionada
        ? p.categoria?._id === this.categoriaSeleccionada
        : true;
      return coincideBusqueda && coincideCategoria;
    });
  }

  /** 📦 Agrupar productos por categoría */
  get productosFiltradosPorCategoria(): { categoria: string; productos: ProductoConStock[] }[] {
    return this.categorias
      .map((cat) => ({
        categoria: cat.nombre,
        productos: this.productosFiltrados.filter(
          (p) => p.categoria?._id === cat._id
        )
      }))
      .filter((g) => g.productos.length > 0);
  }

  /** ➕ Agregar producto (mínimo 12 unidades) */
  agregarAlCarrito(producto: ProductoConStock) {
    if (producto.stock < 12) {
      alert('⚠️ Este producto no tiene suficiente stock (mínimo 12 unidades)');
      return;
    }

    const existe = this.carrito.find((p) => p._id === producto._id);

    if (existe) {
      if (existe.cantidad + 12 <= producto.stock) {
        existe.cantidad += 12;
      } else {
        alert('⚠️ No hay más stock disponible para añadir 12 unidades');
      }
    } else {
      this.carrito.push({ ...producto, cantidad: 12 });
    }

    this.calcularTotal();
  }

  /** 🗑️ Eliminar producto */
  eliminar(producto: ProductoConStock) {
    this.carrito = this.carrito.filter((p) => p._id !== producto._id);
    this.calcularTotal();
  }

  /** 🔢 Cambiar cantidad (mínimo 12 unidades) */
  cambiarCantidad(producto: ProductoConStock, event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const cantidad = input.valueAsNumber;

    if (isNaN(cantidad) || cantidad < 12) {
      alert('⚠️ La cantidad mínima por producto es de 12 unidades');
      input.value = '12';
      return;
    }

    const item = this.carrito.find((p) => p._id === producto._id);
    if (item) {
      if (cantidad <= producto.stock) {
        item.cantidad = cantidad;
      } else {
        alert(`⚠️ Solo hay ${producto.stock} unidades disponibles`);
        item.cantidad = producto.stock;
      }
    }
    this.calcularTotal();
  }

  /** 💰 Calcular total */
  calcularTotal() {
    this.total = this.carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  }

  /** ✅ Confirmar pedido (modo vendedor) */
  async confirmarPedido() {
    if (this.carrito.length === 0) {
      alert('⚠️ Agrega productos primero');
      return;
    }

    if (this.carrito.some((p) => p.cantidad < 12)) {
      alert('⚠️ Todos los productos deben tener al menos 12 unidades');
      return;
    }

    if (!this.nombre.trim() || !this.telefono.trim() || !this.ciudad.trim() || !this.direccion.trim()) {
      alert('⚠️ Debes ingresar nombre, teléfono, ciudad y dirección');
      return;
    }

    if (!/^[0-9]{7,12}$/.test(this.telefono.trim())) {
      alert('⚠️ El teléfono debe tener entre 7 y 12 dígitos');
      return;
    }

    const checkoutData = {
      modo: 'vendedor', // ✅ Añadido para que PaymentComponent lo detecte
      cliente: {
        nombre: this.nombre.trim(),
        telefono: this.telefono.trim(),
        ciudad: this.ciudad.trim(),
        direccion: this.direccion.trim(),
        indicaciones: this.indicaciones.trim(),
      },
      productos: this.carrito.map((p) => ({
        producto: p._id!,
        cantidad: p.cantidad,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen,
      })),
      total: this.total,
      metodoPago: 'Nequi',
    };

    try {
      // 🧾 Guardar temporalmente para el pago
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      // 👉 Redirigir al componente de pago
      this.router.navigate(['/pago'], { state: { modo: 'vendedor' } });

      // 🧹 Limpiar formulario y carrito
      this.resetForm();
    } catch (err) {
      console.error('❌ Error al procesar pedido', err);
      alert('Error al procesar el pedido. Intenta nuevamente.');
    }
  }

  /** 🪟 Control de modal */
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  /** ♻️ Limpiar formulario */
  private resetForm() {
    this.carrito = [];
    this.total = 0;
    this.nombre = '';
    this.telefono = '';
    this.ciudad = '';
    this.direccion = '';
    this.indicaciones = '';
    this.buscador = '';
    this.categoriaSeleccionada = '';
  }
}
