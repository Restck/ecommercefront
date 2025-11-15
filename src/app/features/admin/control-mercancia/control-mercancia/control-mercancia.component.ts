import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RegistroMercanciaComponent } from '../registro-mercancia/registro-mercancia.component'; 
import { MercanciaRegistroComponent } from '../mercancia-registro/mercancia-registro.component';

@Component({
  selector: 'app-control-mercancia',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    RegistroMercanciaComponent,
    MercanciaRegistroComponent
  ],
  templateUrl: './control-mercancia.component.html',
  styleUrls: ['./control-mercancia.component.scss']
})
export class ControlMercanciaComponent {
  tabIndex = 0;

  // Referencia directa al componente hijo
  @ViewChild(MercanciaRegistroComponent)
  mercanciaRegistro!: MercanciaRegistroComponent;

  onRegistroCompleto() {
    // Cambia a la pestaña de listado
    this.tabIndex = 1;

    // Refresca los datos de la tabla
    setTimeout(() => {
      if (this.mercanciaRegistro) {
        this.mercanciaRegistro.cargarMercancia();
      }
    }, 200);
  }
}
