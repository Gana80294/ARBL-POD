import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationControlComponent } from './organization-control.component';

describe('OrganizationControlComponent', () => {
  let component: OrganizationControlComponent;
  let fixture: ComponentFixture<OrganizationControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
