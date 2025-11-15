import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pedido-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule],
  templateUrl: './pedido-detalle-dialog.component.html',
  styleUrls: ['./pedido-detalle-dialog.component.scss']
})
export class PedidoDetalleDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PedidoDetalleDialogComponent>
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
