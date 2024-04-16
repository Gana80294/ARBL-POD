import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOption } from '@angular/material';
import { StatusTemplate } from 'app/models/invoice-details';
import { CustomerGroup } from 'app/models/master';

@Component({
  selector: 'app-status-controls',
  templateUrl: './status-controls.component.html',
  styleUrls: ['./status-controls.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting:  StatusControlsComponent
    }
  ]
})
export class StatusControlsComponent implements OnInit {
  @ViewChild ('allSelected') private allSelected3 : MatOption;
  CustomerGroupChanged = new FormControl([]);
  CustomerGroupFormGroup = new FormControl([]);
 @Input('AllStatusTemplates')
 public AllStatusTemplates: StatusTemplate[]=[];
 
  FilteredCustomerGroups:StatusTemplate[] = [];
  onChange = (obj) => {};
onTouched = (obj) => {};
disabled = false;
  constructor() { 

    // console.log(this.AllStatusTemplates);
    this.AllStatusTemplates = [
      // { key: 'All Invoices', value: 'All' },
      { key: 'Pending (customer)', value: 'Open' },
      { key: 'Saved (customer)', value: 'Saved' },
      { key: 'Partially Confirmed (customer)', value: 'PartiallyConfirmed' },
      { key: 'Confirmed (customer)', value: 'Confirmed' },
    ];
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    
    this.AllStatusTemplates = changes.AllStatusTemplates.currentValue;
    this.FilteredCustomerGroups = this.AllStatusTemplates;
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
       
        
        
        this.FilteredCustomerGroups = this.AllStatusTemplates.filter(p=>p.key.toLowerCase().includes(k.toLowerCase()))
        
      }
      else{
        this.FilteredCustomerGroups = this.AllStatusTemplates
      }
    })
    this.CustomerGroupFormGroup.valueChanges.subscribe((k:string[])=>{
      this.onChange(k);
    })
  }
  toggleAllSelection(): void {
    if (this.allSelected3.selected) {
      const pls = this.AllStatusTemplates.map(x=>x.value);
      pls.push("All");
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
      if (this.CustomerGroupFormGroup.value.length === this.AllStatusTemplates.length) {
        this.allSelected3.select();
      }
    }

  }

  checkFilteredCustomerGroup(val:string):Boolean{
    if(this.AllStatusTemplates.length>0){
      if(this.AllStatusTemplates.find(p=>p.value==val)){
        
        
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
