import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../core/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule
  ]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  form!: FormGroup;

  ngOnInit(): void {
    const usuario = this.auth.getUser();

    this.form = this.fb.group({
      nombre: [usuario.nombre || '', Validators.required],
      correo: [usuario.token ? this.decodeToken(usuario.token).correo : '', Validators.required],
      rol: [usuario.rol || '', Validators.required],
      contrasena: [''] // opcional
    });
  }

  guardarCambios() {
    if (this.form.invalid) return;

    const nuevosDatos = this.form.value;

    this.auth.actualizarPerfil(nuevosDatos).subscribe({
      next: (res) => {
        alert('✅ Perfil actualizado exitosamente');
      },
      error: (err) => {
        alert('❌ Error al actualizar el perfil');
        console.error(err);
      }
    });
  }


  // Utilidad para decodificar el token si lo necesitas
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return {};
    }
  }
}
