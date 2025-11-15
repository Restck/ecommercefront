import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePedidoDialogComponent } from './detalle-pedido-dialog.component';

describe('DetallePedidoDialogComponent', () => {
  let component: DetallePedidoDialogComponent;
  let fixture: ComponentFixture<DetallePedidoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePedidoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePedidoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
