import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { MatOption } from '@angular/material';
import { Organization } from 'app/models/master';

@Component({
  selector: 'app-organization-control',
  templateUrl: './organization-control.component.html',
  styleUrls: ['./organization-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting:  OrganizationControlComponent
    }
  ]
})
export class OrganizationControlComponent implements OnInit {
  @ViewChild ('allSelected') private allSelected3 : MatOption;
  CustomerGroupChanged = new FormControl();
  CustomerGroupFormGroup = new FormControl();
 @Input('AllOrganizations')
 public AllOrganizations: Organization[]=[];
  FilteredCustomerGroups:Organization[] = [];
  onChange = (obj) => {};
onTouched = (obj) => {};
disabled = false;
  constructor() { 

    // console.log(this.AllOrganizations);
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    
    this.AllOrganizations = changes.AllOrganizations.currentValue;
    // console.log(this.AllOrganizations);
    this.FilteredCustomerGroups = this.AllOrganizations;
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
       
        
        
        this.FilteredCustomerGroups = this.AllOrganizations.filter(p=>p.OrganizationCode.toLowerCase().includes(k.toLowerCase()))
        
      }
      else{
        this.FilteredCustomerGroups = this.AllOrganizations
      }
    })
    this.CustomerGroupFormGroup.valueChanges.subscribe((k:string[])=>{
      this.onChange(k);
    })
  }
  toggleAllSelection(): void {
    if (this.allSelected3.selected) {
      const pls = this.AllOrganizations.map(x=>x.OrganizationCode);
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
      if (this.CustomerGroupFormGroup.value.length === this.AllOrganizations.length) {
        this.allSelected3.select();
      }
    }

  }

  checkFilteredCustomerGroup(val:string):Boolean{
    if(this.AllOrganizations.length>0){
      if(this.AllOrganizations.find(p=>p.OrganizationCode==val)){
        
        
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
