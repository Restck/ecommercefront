import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDetalleViewComponent } from './pedido-detalle-view.component';

describe('PedidoDetalleViewComponent', () => {
  let component: PedidoDetalleViewComponent;
  let fixture: ComponentFixture<PedidoDetalleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoDetalleViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoDetalleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
