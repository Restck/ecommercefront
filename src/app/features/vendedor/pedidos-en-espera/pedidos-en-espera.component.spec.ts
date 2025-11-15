import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosEnEsperaComponent } from './pedidos-en-espera.component';

describe('PedidosEnEsperaComponent', () => {
  let component: PedidosEnEsperaComponent;
  let fixture: ComponentFixture<PedidosEnEsperaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosEnEsperaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosEnEsperaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
