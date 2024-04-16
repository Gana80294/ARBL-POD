import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyLayoutComponent } from './modify-layout.component';

describe('ModifyLayoutComponent', () => {
  let component: ModifyLayoutComponent;
  let fixture: ComponentFixture<ModifyLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
