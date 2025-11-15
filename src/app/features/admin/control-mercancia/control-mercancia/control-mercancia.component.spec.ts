import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlMercanciaComponent } from './control-mercancia.component';

describe('ControlMercanciaComponent', () => {
  let component: ControlMercanciaComponent;
  let fixture: ComponentFixture<ControlMercanciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlMercanciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlMercanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
