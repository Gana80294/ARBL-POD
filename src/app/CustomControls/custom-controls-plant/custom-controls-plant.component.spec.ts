import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomControlsPlantComponent } from './custom-controls-plant.component';

describe('CustomControlsPlantComponent', () => {
  let component: CustomControlsPlantComponent;
  let fixture: ComponentFixture<CustomControlsPlantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomControlsPlantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomControlsPlantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
