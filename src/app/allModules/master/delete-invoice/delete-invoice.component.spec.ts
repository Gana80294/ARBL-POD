import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteInvoiceComponent } from './delete-invoice.component';

describe('DeleteInvoiceComponent', () => {
  let component: DeleteInvoiceComponent;
  let fixture: ComponentFixture<DeleteInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
