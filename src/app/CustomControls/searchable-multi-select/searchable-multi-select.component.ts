import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOption } from '@angular/material';
import { CustomerGroup, SLSCustGroupData } from 'app/models/master';

@Component({
  selector: 'app-searchable-multi-select',
  templateUrl: './searchable-multi-select.component.html',
  styleUrls: ['./searchable-multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting:  SearchableMultiSelectComponent
    }
  ]
})
export class SearchableMultiSelectComponent implements OnInit, OnChanges,ControlValueAccessor {
  @ViewChild ('allSelected') private allSelected3 : MatOption;
  CustomerGroupChanged = new FormControl();
  CustomerGroupFormGroup = new FormControl();
 @Input('AllCustomerGroups')
 public AllCustomerGroups: CustomerGroup[]=[];
  FilteredCustomerGroups:CustomerGroup[] = [];
  onChange = (obj) => {};
onTouched = (obj) => {};
disabled = false;
  constructor() { 

    // console.log(this.AllCustomerGroups);
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    
    this.AllCustomerGroups = changes.AllCustomerGroups.currentValue;
    this.FilteredCustomerGroups = this.AllCustomerGroups;
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
       
        
        
        this.FilteredCustomerGroups = this.AllCustomerGroups.filter(p=>p.CustomerGroupCode.toLowerCase().includes(k.toLowerCase()))
        
      }
      else{
        this.FilteredCustomerGroups = this.AllCustomerGroups
      }
    })
    this.CustomerGroupFormGroup.valueChanges.subscribe((k:string[])=>{
      this.onChange(k);
    })
  }
  toggleAllSelection(): void {
    if (this.allSelected3.selected) {
      const pls = this.AllCustomerGroups.map(x=>x.CustomerGroupCode);
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
      if (this.CustomerGroupFormGroup.value.length === this.AllCustomerGroups.length) {
        this.allSelected3.select();
      }
    }

  }

  checkFilteredCustomerGroup(val:string):Boolean{
    if(this.AllCustomerGroups.length>0){
      if(this.AllCustomerGroups.find(p=>p.CustomerGroupCode==val)){
        
        
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
