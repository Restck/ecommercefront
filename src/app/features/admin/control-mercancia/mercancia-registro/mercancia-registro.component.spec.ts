import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MercanciaRegistroComponent } from './mercancia-registro.component';

describe('MercanciaRegistroComponent', () => {
  let component: MercanciaRegistroComponent;
  let fixture: ComponentFixture<MercanciaRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MercanciaRegistroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MercanciaRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
