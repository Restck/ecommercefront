import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  // Signals reactivas
  isLoggedIn = signal(false);
  isAdminSignal = signal(false);
  isVendedorSignal = signal(false);
  isClienteSignal = signal(false);
  nombreUsuario = signal('');

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  // 🔑 Login
  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      correo: email,
      contrasena: password
    });
  }

  // 🧾 Registro
  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  // 💾 Guardar sesión (token + rol + nombre + id)
  guardarSesion(token: string, rol: string, nombre: string, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('userId', userId);

    this.isLoggedIn.set(true);
    this.isAdminSignal.set(rol === 'admin');
    this.isVendedorSignal.set(rol === 'vendedor');
    this.isClienteSignal.set(rol === 'cliente');
    this.nombreUsuario.set(nombre);
  }

  // 🚪 Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    localStorage.removeItem('userId');

    this.isLoggedIn.set(false);
    this.isAdminSignal.set(false);
    this.isVendedorSignal.set(false);
    this.isClienteSignal.set(false);
    this.nombreUsuario.set('');

    this.router.navigate(['/login']);
  }

  // ♻️ Restaurar sesión desde localStorage
  private restoreSession() {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const nombre = localStorage.getItem('nombre');
    const userId = localStorage.getItem('userId');

    if (token && rol && nombre && userId) {
      this.isLoggedIn.set(true);
      this.isAdminSignal.set(rol === 'admin');
      this.isVendedorSignal.set(rol === 'vendedor');
      this.isClienteSignal.set(rol === 'cliente');
      this.nombreUsuario.set(nombre);
    }
  }

  // 🧩 Actualizar perfil
  actualizarPerfil(datos: any) {
    const token = this.getToken();
    return this.http.put<any>(
      `${this.apiUrl}/actualizar-perfil`,
      datos,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(res => {
      // Actualiza nombre globalmente al cambiar perfil
      this.nombreUsuario.set(datos.nombre);
      localStorage.setItem('nombre', datos.nombre);
      return res;
    });
  }

  // 📦 Getters
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /** ✅ Devuelve todos los datos necesarios del usuario */
  getUser(): { _id: string | null, rol: string | null, token: string | null, nombre: string | null } {
    return {
      _id: this.getUserId(),
      rol: this.getRol(),
      token: this.getToken(),
      nombre: this.getNombre()
    };
  }

  // 🔍 Verificación de roles
  isAdmin(): boolean {
    return this.getRol() === 'admin';
  }

  isVendedor(): boolean {
    return this.getRol() === 'vendedor';
  }

  isCliente(): boolean {
    return this.getRol() === 'cliente';
  }
}
