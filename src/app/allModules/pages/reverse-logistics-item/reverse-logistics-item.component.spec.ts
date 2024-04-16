import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseLogisticsItemComponent } from './reverse-logistics-item.component';

describe('ReverseLogisticsItemComponent', () => {
  let component: ReverseLogisticsItemComponent;
  let fixture: ComponentFixture<ReverseLogisticsItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReverseLogisticsItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseLogisticsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
