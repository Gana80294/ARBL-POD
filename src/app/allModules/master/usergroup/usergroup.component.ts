import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, Organization, CustomerGroup, SLSGroup } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { DataMigration } from 'app/services/DataMigration.service';
import { ProgressBarBehaviourSubject } from 'app/services/ProgressBarBehaviourSubject.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-CustomerGroup',
  templateUrl: './userGroup.component.html',
  styleUrls: ['./UserGroup.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CustomerGroupComponent implements OnInit {
  @ViewChild('fileInput',) fileInput: ElementRef;
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  BulkFile: File;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  DistinctOrganizations: string[] = [];
  AllCustomerGroups: CustomerGroup[] = [];
  AllSalesGroups: SLSGroup[] = [];
  SelectedCustomerGroup: CustomerGroup;
  searchText = '';
  selectID = '';
  CustomerGroupFormGroup: FormGroup;
  KeysFormArray: FormArray = this._formBuilder.array([]);
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _dataMigraton: DataMigration,
    private progbrBhvrsbjct: ProgressBarBehaviourSubject
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.CustomerGroupFormGroup = this._formBuilder.group({
      CustomerGroupCode: ['', Validators.required],
      Sector: ['', Validators.required]
    });
    this.SelectedCustomerGroup = new CustomerGroup();
    this.ChangeInProgressBarBehaviourSubject();
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
      if (this.MenuItems.indexOf('Organization') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllCustomerGroups();

    } else {
      this._router.navigate(['/auth/login']);
    }
  }



  ResetControl(): void {
    this.selectID = '';
    this.SelectedCustomerGroup = new CustomerGroup();
    this.CustomerGroupFormGroup.reset();
    Object.keys(this.CustomerGroupFormGroup.controls).forEach(key => {
      this.CustomerGroupFormGroup.get(key).markAsUntouched();
    });

  }

  AddCustomerGroup(): void {
    this.ResetControl();
  }
  BulkUpload(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.BulkFile = target.files[0];
    this.OpenConfirmationDialog(" create the CustomerGroups with ", this.BulkFile.name);
  }
  GetAllCustomerGroups(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllCustomerGroups().subscribe(
      (data) => {
        if (data) {
          this.AllCustomerGroups = data as CustomerGroup[];
          if (this.AllCustomerGroups.length && this.AllCustomerGroups.length > 0) {
            this.loadSelectedCustomerGroup(this.AllCustomerGroups[0]);
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

  loadSelectedCustomerGroup(CustomerGroup: CustomerGroup): void {
    this.ResetControl();
    this.SelectedCustomerGroup = CustomerGroup;
    this.selectID = CustomerGroup.CustomerGroupCode;
    this.CustomerGroupFormGroup.get('CustomerGroupCode').patchValue(CustomerGroup.CustomerGroupCode);
    this.CustomerGroupFormGroup.get('Sector').patchValue(CustomerGroup.Sector);
  }

  SaveClicked(): void {
    if (this.CustomerGroupFormGroup.valid) {
      this.GetCustomerGroupValues();
      if (this.SelectedCustomerGroup.CreatedBy) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.CustomerGroupFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.CustomerGroupFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.CustomerGroupFormGroup);
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

  OpenConfirmationDialog(Actiontype: string, filename?: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: filename ? filename : 'CustomerGroup'
      },
      panelClass: 'confirmation-dialog'
    };
    // console.log(Actiontype);

    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateCustomerGroup();
          } else if (Actiontype === 'Update') {
            this.UpdateCustomerGroup();
          } else if (Actiontype === 'Delete') {
            this.DeleteCustomerGroup();
          }
          else if (Actiontype === ' create the CustomerGroups with ') {
            // console.log("BulkFile");

            this._dataMigraton.BulkUploadCustomerGroup(this.BulkFile).then(() => {
              this.GetAllCustomerGroups();
            });

          }
        }
      });
  }

  GetCustomerGroupValues(): void {
    this.SelectedCustomerGroup.CustomerGroupCode = this.CustomerGroupFormGroup.get('CustomerGroupCode').value;
    this.SelectedCustomerGroup.Sector = this.CustomerGroupFormGroup.get('Sector').value;

  }

  ChangeInProgressBarBehaviourSubject() {
    this.progbrBhvrsbjct.ProgressBarSubject.subscribe((x) => {
      if (x == "hide") {
        this.IsProgressBarVisibile = false;
      }
      else if (x = "show") {
        this.IsProgressBarVisibile = true;
      }
    })
  }
  CreateCustomerGroup(): void {
    this.SelectedCustomerGroup.CreatedBy = this.CurrentUserID.toString();

    this.IsProgressBarVisibile = true;
    this._masterService.CreateCustomerGroup(this.SelectedCustomerGroup).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('CustomerGroup created successfully', SnackBarStatus.success);
        this.GetAllCustomerGroups();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  UpdateCustomerGroup(): void {
    this.SelectedCustomerGroup.ModifiedBy = this.CurrentUserID.toString();

    this.IsProgressBarVisibile = true;
    this._masterService.UpdateCustomerGroup(this.SelectedCustomerGroup).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Organization updated successfully', SnackBarStatus.success);
        this.GetAllCustomerGroups();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  DeleteCustomerGroup(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteCustomerGroup(this.SelectedCustomerGroup).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Organization deleted successfully', SnackBarStatus.success);
        this.GetAllCustomerGroups();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  exportAsXLSX() {
    // console.log(this.AllCustomerGroups,"Allorg");
    var customers = [];
    this.AllCustomerGroups.forEach(item => {
      var temp = new CustomerGroup();
      temp.CustomerGroupCode = item.CustomerGroupCode;
      temp.Sector = item.Sector;
      customers.push(temp);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(customers);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelFileName = "CustomerGroup"
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    const EXCEL_EXTENSION = ".xlsx"
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
