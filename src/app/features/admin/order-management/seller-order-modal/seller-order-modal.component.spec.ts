import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerOrderModalComponent } from './seller-order-modal.component';

describe('SellerOrderModalComponent', () => {
  let component: SellerOrderModalComponent;
  let fixture: ComponentFixture<SellerOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
