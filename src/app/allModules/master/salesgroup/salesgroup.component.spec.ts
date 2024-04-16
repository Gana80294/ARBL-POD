import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesgroupComponent } from './salesgroup.component';

describe('SalesgroupComponent', () => {
  let component: SalesgroupComponent;
  let fixture: ComponentFixture<SalesgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesgroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
