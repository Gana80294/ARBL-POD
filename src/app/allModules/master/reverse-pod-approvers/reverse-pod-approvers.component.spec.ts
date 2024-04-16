import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReversePodApproversComponent } from './reverse-pod-approvers.component';

describe('ReversePodApproversComponent', () => {
  let component: ReversePodApproversComponent;
  let fixture: ComponentFixture<ReversePodApproversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReversePodApproversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReversePodApproversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
