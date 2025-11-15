import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../core/auth.service';
import { CartService } from '../../../core/cart.service'; // ✅ importa el carrito

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    RouterLink,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private cart = inject(CartService); // ✅ inyecta el servicio del carrito
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        const { token, usuario } = res;
        const rol = usuario.rol;
        const nombre = usuario.nombre;
        const userId = usuario._id || usuario.id; // ✅ se adapta a ambos casos

        // ✅ Guarda sesión con id incluido
        this.auth.guardarSesion(token, rol, nombre, userId);

        // ✅ Carga el carrito correspondiente a este usuario
        this.cart.recargarCarritoPorUsuario();

        // 🔀 Redirección según rol
        switch (rol) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'vendedor':
            this.router.navigate(['/vendedor']);
            break;
          case 'cliente':
          default:
            this.router.navigate(['/productos']);
            break;
        }
      },
      error: () => {
        alert('Credenciales inválidas');
      },
    });
  }
}
