import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteOrdersModalComponent } from './cliente-orders-modal.component';

describe('ClienteOrdersModalComponent', () => {
  let component: ClienteOrdersModalComponent;
  let fixture: ComponentFixture<ClienteOrdersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteOrdersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteOrdersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
