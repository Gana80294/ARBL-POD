import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordUsingSMSOTPComponent } from './change-password-using-smsotp.component';

describe('ChangePasswordUsingSMSOTPComponent', () => {
  let component: ChangePasswordUsingSMSOTPComponent;
  let fixture: ComponentFixture<ChangePasswordUsingSMSOTPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePasswordUsingSMSOTPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordUsingSMSOTPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
