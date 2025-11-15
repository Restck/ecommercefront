import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-seller-order-products-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIcon],
  templateUrl: './seller-order-products-modal.component.html',
  styleUrls: ['./seller-order-products-modal.component.scss'],
})
export class SellerOrderProductsModalComponent implements OnInit {
  @Input() order: any;
  totalPedido: number = 0;

  constructor(
    private dialogRef: MatDialogRef<SellerOrderProductsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.order = data?.order;
  }

  ngOnInit(): void {
    this.calcularTotal();
  }

  calcularTotal(): void {
    if (this.order?.productos?.length) {
      this.totalPedido = this.order.productos.reduce(
        (acc: number, prod: any) =>
          acc + (prod?.producto?.precio || 0) * (prod?.cantidad || 0),
        0
      );
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
