import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOption } from '@angular/material';
import { CustomerGroup } from 'app/models/master';

@Component({
  selector: 'app-division-control',
  templateUrl: './division-control.component.html',
  styleUrls: ['./division-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting:  DivisionControlComponent
    }
  ]
})
export class DivisionControlComponent implements OnInit {
  @ViewChild ('allSelected') private allSelected3 : MatOption;
  CustomerGroupChanged = new FormControl();
  CustomerGroupFormGroup = new FormControl();
 @Input('Divisions')
 public Divisions: string[]=[];
  FilteredCustomerGroups:string[] = [];
  onChange = (obj) => {};
onTouched = (obj) => {};
disabled = false;
  constructor() { 

    // console.log(this.Divisions);
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    
    this.Divisions = changes.Divisions.currentValue;
    // console.log(this.Divisions);
    this.FilteredCustomerGroups = this.Divisions;
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
    
    this.CustomerGroupChanged.valueChanges.subscribe((k:string)=>{
      if(k){
       
        
        // console.log(this.Divisions)
        this.FilteredCustomerGroups = this.Divisions;
        // .filter(p=>p.toLowerCase().includes(k.toLowerCase()))
        // console.log(this.FilteredCustomerGroups);
      }
      else{
        this.FilteredCustomerGroups = this.Divisions
      }
    })
    this.CustomerGroupFormGroup.valueChanges.subscribe((k:string[])=>{
      this.onChange(k);
    })
  }
  toggleAllSelection(): void {
    if (this.allSelected3.selected) {
      const pls = this.Divisions.map(x=>x);
      pls.push("all");
      this.CustomerGroupFormGroup.patchValue(pls);
    } else {
      this.CustomerGroupFormGroup.patchValue([]);
    }
    
  }

  toggleCustomerGrpPerOne(){
    if (this.allSelected3.selected) {
      this.allSelected3.deselect();
      return false;
    }
    if (this.CustomerGroupFormGroup.value.length) {
      if (this.CustomerGroupFormGroup.value.length === this.Divisions.length) {
        this.allSelected3.select();
      }
    }

  }

  checkFilteredCustomerGroup(val:string):Boolean{
    if(this.Divisions.length>0){
      if(this.Divisions.find(p=>p==val)){
        
        
        return true;
      }
      else{
        
        
        return false;
      }
    }
    else{
      
        
      return true;
    }
  }

}
