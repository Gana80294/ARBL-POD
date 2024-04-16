import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableMultiSelectComponent } from './searchable-multi-select.component';

describe('SearchableMultiSelectComponent', () => {
  let component: SearchableMultiSelectComponent;
  let fixture: ComponentFixture<SearchableMultiSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchableMultiSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchableMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
