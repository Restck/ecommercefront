import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDetalleDialogComponent } from './pedido-detalle-dialog.component';

describe('PedidoDetalleDialogComponent', () => {
  let component: PedidoDetalleDialogComponent;
  let fixture: ComponentFixture<PedidoDetalleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoDetalleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
