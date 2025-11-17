import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  _id: string;
  nombre: string;
}

export interface Proveedor {
  _id?: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: Date;
}

export interface Movimiento {
  tipo: 'entrada' | 'salida' | 'traslado';
  cantidad: number;
  stock?: number;
  cantidadBodega?: number;
  observaciones?: string;
  bodegaOrigen?: string;
  bodegaDestino?: string;
  fecha?: string;
}

export interface Producto {
  _id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  stock: number;
  cantidadBodega?: number;
  categoria: Categoria;
  proveedor?: Proveedor | null;
  costoCompra?: number;
  fechaIngreso?: string;
  ubicacionAlmacen?: string;
  destino?: string;
  activo?: boolean;
  movimientos?: Movimiento[];
}

@Injectable({ providedIn: 'root' })
export class ProductoService {

  // ===========================
  // 🔗 BASE URL DESDE ENV
  // ===========================
  private apiUrl = `${environment.apiUrl}/productos`;
  private apiCategorias = `${environment.apiUrl}/categorias`;
  private apiProveedores = `${environment.apiUrl}/proveedores`;

  private productosActualizados = new BehaviorSubject<boolean>(false);
  productosActualizados$ = this.productosActualizados.asObservable();

  constructor(private http: HttpClient) {}

  /* ===========================
        HELPERS
  =========================== */

  getImagenUrl(nombreArchivo: string | undefined): string {
    if (!nombreArchivo) return 'assets/img/no-image.png';
    return `${environment.apiUrl}/uploads/productos/${nombreArchivo}`;
  }

  /* ===========================
        CRUD PRODUCTOS
  =========================== */

  getProductos(): Observable<Producto[]> {
    return this.http
      .get<{ success: boolean; data: Producto[] }>(this.apiUrl)
      .pipe(
        map(res => (res.success && Array.isArray(res.data) ? res.data : [])),
        catchError(err => {
          console.error('❌ Error en getProductos', err);
          return of([]);
        })
      );
  }

  getProducto(id: string): Observable<Producto> {
    return this.http
      .get<{ success: boolean; data: Producto }>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  crearProducto(data: FormData): Observable<Producto> {
    return this.http.post<{ success: boolean; data: Producto }>(this.apiUrl, data)
      .pipe(
        map(res => {
          this.productosActualizados.next(true);
          return res.data;
        })
      );
  }

  crearProductoConImagen(producto: Producto, imagen?: File): Observable<Producto> {
    const formData = new FormData();
    formData.append('nombre', producto.nombre);
    formData.append('descripcion', producto.descripcion);
    formData.append('precio', producto.precio.toString());

    if (producto.destino === 'stock') {
      formData.append('stock', (producto.stock ?? 1).toString());
      formData.append('cantidadBodega', '0');
    } else if (producto.destino === 'bodega') {
      formData.append('stock', '0');
      formData.append('cantidadBodega', (producto.cantidadBodega ?? 1).toString());
    }

    formData.append('categoria', producto.categoria._id);
    if (producto.proveedor?._id) formData.append('proveedor', producto.proveedor._id);
    if (producto.costoCompra != null) formData.append('costoCompra', producto.costoCompra.toString());
    if (producto.ubicacionAlmacen) formData.append('ubicacionAlmacen', producto.ubicacionAlmacen);
    if (producto.destino) formData.append('destino', producto.destino);
    if (imagen) formData.append('imagen', imagen);

    return this.crearProducto(formData);
  }

  actualizarProducto(id: string, data: FormData): Observable<Producto> {
    return this.http.put<{ success: boolean; data: Producto }>(`${this.apiUrl}/${id}`, data)
      .pipe(
        map(res => {
          this.productosActualizados.next(true);
          return res.data;
        })
      );
  }

  guardarProducto(id: string | null, data: FormData): Observable<Producto> {
    return id ? this.actualizarProducto(id, data) : this.crearProducto(data);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        this.productosActualizados.next(true);
        return res;
      })
    );
  }

  /* ===========================
      MOVIMIENTOS
  =========================== */

  actualizarDestino(id: string, destino: string, cantidad?: number): Observable<Producto> {
    return this.http
      .patch<{ success: boolean; data: Producto }>(
        `${this.apiUrl}/${id}/destino`,
        { destino, cantidad }
      )
      .pipe(
        map(res => {
          this.productosActualizados.next(true);
          return res.data;
        })
      );
  }

  registrarMovimiento(idProducto: string, movimiento: Movimiento): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${idProducto}/movimientos`, movimiento).pipe(
      map(res => {
        this.productosActualizados.next(true);
        return res;
      })
    );
  }

  /* ===========================
      STOCK
  =========================== */

  actualizarStock(id: string, cantidad: number, esVenta: boolean = false): Observable<Producto> {
    const body = esVenta
      ? { cantidadVendida: cantidad }
      : { cantidad };

    return this.http
      .put<{ success: boolean; data: Producto }>(`${this.apiUrl}/${id}/stock`, body)
      .pipe(
        map(res => {
          this.productosActualizados.next(true);
          return res.data;
        }),
        catchError(err => {
          console.error('❌ Error al actualizar stock', err);
          throw err;
        })
      );
  }

  /* ===========================
      CATEGORÍAS
  =========================== */

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiCategorias);
  }

  crearCategoria(nombre: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiCategorias, { nombre });
  }

  /* ===========================
      PROVEEDORES
  =========================== */

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiProveedores);
  }

  crearProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiProveedores, proveedor);
  }

  getProveedorById(id: string): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiProveedores}/${id}`);
  }

  actualizarProveedor(id: string, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiProveedores}/${id}`, proveedor);
  }

  eliminarProveedor(id: string): Observable<any> {
    return this.http.delete(`${this.apiProveedores}/${id}`);
  }
}
