import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseLogisticsComponent } from './reverse-logistics.component';

describe('ReverseLogisticsComponent', () => {
  let component: ReverseLogisticsComponent;
  let fixture: ComponentFixture<ReverseLogisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReverseLogisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseLogisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
