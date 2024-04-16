import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreationErrorLogComponent } from './user-creation-error-log.component';

describe('UserCreationErrorLogComponent', () => {
  let component: UserCreationErrorLogComponent;
  let fixture: ComponentFixture<UserCreationErrorLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCreationErrorLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCreationErrorLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
