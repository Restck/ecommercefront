import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroMercanciaComponent } from './registro-mercancia.component';

describe('RegistroMercanciaComponent', () => {
  let component: RegistroMercanciaComponent;
  let fixture: ComponentFixture<RegistroMercanciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroMercanciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroMercanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
