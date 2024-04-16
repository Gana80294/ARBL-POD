import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, Reason } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { DataMigration } from 'app/services/DataMigration.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ReasonComponent implements OnInit {
  MenuItems: string[];
  @ViewChild('fileInput', ) fileInput: ElementRef;
  BulkFile:File
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  DistinctReasons: string[] = [];
  AllReasons: Reason[] = [];
  SelectedReason: Reason;
  searchText = '';
  selectReasonID = 0;
  ReasonFormGroup: FormGroup;
  KeysFormArray: FormArray = this._formBuilder.array([]);
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _dataMigraton:DataMigration
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.ReasonFormGroup = this._formBuilder.group({
      Description: ['', Validators.required],
    });
    this.SelectedReason = new Reason();
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.userName;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Reason') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllReasons();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ResetControl(): void {
    this.selectReasonID = 0;
    this.SelectedReason = new Reason();
    this.ReasonFormGroup.reset();
    Object.keys(this.ReasonFormGroup.controls).forEach(key => {
      this.ReasonFormGroup.get(key).markAsUntouched();
    });

  }

  AddReason(): void {
    this.ResetControl();
  }
  BulkUpload(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.BulkFile = target.files[0];
    this.OpenConfirmationDialog(" create the Reasons with ", this.BulkFile.name);
  }
  GetAllReasons(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllReasons().subscribe(
      (data) => {
        if (data) {
          this.AllReasons = data as Reason[];
          if (this.AllReasons.length && this.AllReasons.length > 0) {
            this.loadSelectedReason(this.AllReasons[0]);
          }
          this.IsProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  loadSelectedReason(reason: Reason): void {
    this.ResetControl();
    this.SelectedReason = reason;
    this.selectReasonID = reason.ReasonID;
    this.ReasonFormGroup.get('Description').patchValue(reason.Description);
  }

  SaveClicked(): void {
    if (this.ReasonFormGroup.valid) {
      this.GetReasonValues();
      if (this.SelectedReason.ReasonID) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.ReasonFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.ReasonFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.ReasonFormGroup);
    }
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });
  }

  OpenConfirmationDialog(Actiontype: string , filename?: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: filename?filename: 'Reason'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateReason();
          } else if (Actiontype === 'Update') {
            this.UpdateReason();
          } else if (Actiontype === 'Delete') {
            this.DeleteReason();
          }
          else if (Actiontype === ' create the Reasons with ') {
            console.log("BulkFile");

            this._dataMigraton.BulkUploadReason(this.BulkFile).then(()=>{
              this.GetAllReasons();
            });
            
            
          }
        }
      });
  }

  GetReasonValues(): void {
    this.SelectedReason.Description = this.ReasonFormGroup.get('Description').value;
  }
  CreateReason(): void {
    this.SelectedReason.CreatedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateReason(this.SelectedReason).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Reason created successfully', SnackBarStatus.success);
        this.GetAllReasons();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  UpdateReason(): void {
    this.SelectedReason.ModifiedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateReason(this.SelectedReason).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Reason updated successfully', SnackBarStatus.success);
        this.GetAllReasons();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  DeleteReason(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteReason(this.SelectedReason).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Reason deleted successfully', SnackBarStatus.success);
        this.GetAllReasons();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  exportAsXLSX(){
    // console.log(this.AllReasons,"Allorg");
    var reasons=[];
    this.AllReasons.forEach(item => {
      var temp=new Reason();
      temp.Description=item.Description;
      reasons.push(temp);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(reasons);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelFileName = "Reason"
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    const EXCEL_EXTENSION =".xlsx"
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
