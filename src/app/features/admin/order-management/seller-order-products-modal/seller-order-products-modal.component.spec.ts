import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerOrderProductsModalComponent } from './seller-order-products-modal.component';

describe('SellerOrderProductsModalComponent', () => {
  let component: SellerOrderProductsModalComponent;
  let fixture: ComponentFixture<SellerOrderProductsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerOrderProductsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerOrderProductsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
