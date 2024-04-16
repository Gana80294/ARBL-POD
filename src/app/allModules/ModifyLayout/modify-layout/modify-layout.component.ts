import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogData } from 'app/notifications/notification-dialog/dialog-data';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { ColumnData } from './ColumnData';

@Component({
  selector: 'app-modify-layout',
  templateUrl: './modify-layout.component.html',
  styleUrls: ['./modify-layout.component.scss']
})
export class ModifyLayoutComponent implements OnInit {
  displayedColumns =[];
  selectedviewColumns = [];
  TableColumnsFormGroup : FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: ColumnData,
  public dialogRef: MatDialogRef<ModifyLayoutComponent>,private _formBuilder:FormBuilder) {
    this.displayedColumns = this.dialogData.TableColumns;
    this.selectedviewColumns = this.dialogData.selectedColumns;
   }
   get columnsFormArray() {
    return this.TableColumnsFormGroup.controls.specifiedColumns as FormArray;
  }
  ngOnInit() {
    this.TableColumnsFormGroup = this._formBuilder.group({
      specifiedColumns:new FormArray([])
    })
    this.addCheckboxes();
  }
  private addCheckboxes() {
    this.TableColumnsFormGroup.controls.specifiedColumns = new FormArray([]);
    this.displayedColumns.forEach((x) => this.columnsFormArray.push(new FormControl(this.selectedviewColumns.indexOf(x)>=0?true:false)));
  }
  
  
  ClearSelected(){
    this.columnsFormArray.reset(false);
  }
  YesClicked(){
   // this.dialogRef.close();
    this.selectedviewColumns = this.columnsFormArray.value.map((checked, i) => checked ? this.displayedColumns[i] : null).filter(v => v !== null);
    // console.log(this.selectedviewColumns);
    
     this.dialogRef.close(this.selectedviewColumns);
  }
  SelectAllClicked(){
    this.TableColumnsFormGroup.controls.specifiedColumns = new FormArray([]);
    this.displayedColumns.forEach((x) => this.columnsFormArray.push(new FormControl(true)));
  }
}
