import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOption } from '@angular/material';
import { Plant, PlantGroup } from 'app/models/master';

@Component({
  selector: 'app-custom-controls-plant-group',
  templateUrl: './custom-controls-plant-group.component.html',
  styleUrls: ['./custom-controls-plant-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomControlsPlantGroupComponent
    }
  ]
})
export class CustomControlsPlantGroupComponent implements OnInit {
  @ViewChild('allSelected5') private allSelected5: MatOption;
  CustomerGroupChanged = new FormControl();
  CustomerGroupFormGroup = new FormControl();
  @Input('AllPlants')
  public AllPlants: PlantGroup[] = [];
  FilteredCustomerGroups: PlantGroup[] = [];
  onChange = (obj) => { };
  onTouched = (obj) => { };
  disabled = false;
  constructor() {

    // console.log(this.AllPlants);

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.AllPlants = changes.AllPlants.currentValue as PlantGroup[];
    this.FilteredCustomerGroups = this.AllPlants;
  }
  writeValue(obj: string[]): void {
    this.CustomerGroupFormGroup.patchValue(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {

    this.CustomerGroupChanged.valueChanges.subscribe((k: string) => {
      if (k) {
        this.FilteredCustomerGroups = this.AllPlants.filter(p => p.name.toLowerCase().includes(k.toLowerCase()))
      }
      else {
        this.FilteredCustomerGroups = this.AllPlants
      }
    })
    this.CustomerGroupFormGroup.valueChanges.subscribe((k: string[]) => {
      this.onChange(k);
    })
  }

  toggleAllSelection(): void {
    if (this.allSelected5.selected) {
      const pls = this.AllPlants.map(x => x.name);
      pls.push("all");
      this.CustomerGroupFormGroup.patchValue(pls);
    } else {
      this.CustomerGroupFormGroup.patchValue([]);
    }

  }

  toggleCustomerGrpPerOne() {
    if (this.allSelected5.selected) {
      this.allSelected5.deselect();
      return false;
    }
    if (this.CustomerGroupFormGroup.value.length) {
      if (this.CustomerGroupFormGroup.value.length === this.AllPlants.length) {
        this.allSelected5.select();
      }
    }

  }

  checkFilteredCustomerGroup(val: string): Boolean {
    if (this.AllPlants.length > 0) {
      if (this.AllPlants.find(p => p.name == val)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }
  }

}

