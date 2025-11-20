import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // 👉 URL correcta (sin doble /api)
  private apiUrl = `${environment.apiUrl}/auth`;

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

  // 💾 Guardar sesión
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

  // 🚪 Logout
  logout() {
    localStorage.clear();

    this.isLoggedIn.set(false);
    this.isAdminSignal.set(false);
    this.isVendedorSignal.set(false);
    this.isClienteSignal.set(false);
    this.nombreUsuario.set('');

    this.router.navigate(['/login']);
  }

  // ♻️ Restaurar sesión
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(`${this.apiUrl}/actualizar-perfil`, datos, { headers })
      .pipe(res => {
        this.nombreUsuario.set(datos.nombre);
        localStorage.setItem('nombre', datos.nombre);
        return res;
      });
  }

  // 📦 Getters
  getToken() { return localStorage.getItem('token'); }
  getRol() { return localStorage.getItem('rol'); }
  getNombre() { return localStorage.getItem('nombre'); }
  getUserId() { return localStorage.getItem('userId'); }

  getUser() {
    return {
      _id: this.getUserId(),
      rol: this.getRol(),
      token: this.getToken(),
      nombre: this.getNombre()
    };
  }

  // 🔍 Roles
  isAdmin() { return this.getRol() === 'admin'; }
  isVendedor() { return this.getRol() === 'vendedor'; }
  isCliente() { return this.getRol() === 'cliente'; }
}
