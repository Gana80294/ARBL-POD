import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusControlsComponent } from './status-controls.component';

describe('StatusControlsComponent', () => {
  let component: StatusControlsComponent;
  let fixture: ComponentFixture<StatusControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
