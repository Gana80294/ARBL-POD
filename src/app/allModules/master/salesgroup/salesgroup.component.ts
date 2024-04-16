import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig, MatOption } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationDetails, CustomerGroup, SLSCustGroupData, SLSGroup } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { DataMigration } from 'app/services/DataMigration.service';
import { MasterService } from 'app/services/master.service';
import { ProgressBarBehaviourSubject } from 'app/services/ProgressBarBehaviourSubject.service';
import { Guid } from 'guid-typescript';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-salesgroup',
  templateUrl: './salesgroup.component.html',
  styleUrls: ['./salesgroup.component.scss']
})
export class SalesgroupComponent implements OnInit {
  @ViewChild('fileInput',) fileInput: ElementRef;
  @ViewChild('allSelected',) allSelected: MatOption
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  BulkFile: File;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  DistinctOrganizations: string[] = [];
  AllSalesGroups: SLSCustGroupData[] = [];
  SelectedSalesGroup: SLSCustGroupData;
  searchText = '';
  AllCustomerGroups: CustomerGroup[]
  selectID = '';
  SalesGroupFormGroup: FormGroup;
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
    this.SalesGroupFormGroup = this._formBuilder.group({
      SalesGroupCode: ['', Validators.required],
      Description: ['', Validators.required],
      CGS: ['', Validators.required]
    });
    this.SelectedSalesGroup = new SLSCustGroupData();
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
      this.GetAllCustomerGroups()

    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ResetControl(): void {
    this.selectID = '';
    this.SelectedSalesGroup = new SLSCustGroupData();
    this.SalesGroupFormGroup.reset();
    Object.keys(this.SalesGroupFormGroup.controls).forEach(key => {
      this.SalesGroupFormGroup.get(key).markAsUntouched();
    });

  }
  toggleAllSelection() {
    if (this.allSelected.selected) {

      let allSls = this.AllCustomerGroups.map(k => k.CustomerGroupCode);
      allSls.push("all");
      this.SalesGroupFormGroup.get('CGS').patchValue(allSls);
    } else {


      this.SalesGroupFormGroup.get('CGS').patchValue([]);
    }


  }

  togglePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();

    }

    let cc = this.SalesGroupFormGroup.get('CGS').value.length
    // console.log(cc,this.AllCustomerGroups.length);

    if (cc) {
      if (cc == this.AllCustomerGroups.length) {
        //console.log(cc, this.AllCustomerGroups.length);
        this.allSelected.select();


      }
    }


  }

  AddSLSGroup(): void {
    this.ResetControl();
  }
  BulkUpload(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.BulkFile = target.files[0];
    this.OpenConfirmationDialog(" create the SLSGroups with ", this.BulkFile.name);
  }
  GetAllSLSGroups(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllSalesGroups().subscribe(
      (data) => {
        if (data) {
          this.AllSalesGroups = data as SLSCustGroupData[];
          if (this.AllSalesGroups.length && this.AllSalesGroups.length > 0) {
            this.loadSelectedSLSGroup(this.AllSalesGroups[0]);
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
  GetAllCustomerGroups(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllCustomerGroups().subscribe(
      (data) => {
        if (data) {
          this.AllCustomerGroups = data as CustomerGroup[];
          if (this.AllCustomerGroups.length && this.AllCustomerGroups.length > 0) {
            this.GetAllSLSGroups();
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

  loadSelectedSLSGroup(SLSGroup: SLSCustGroupData): void {
    this.ResetControl();
    this.SelectedSalesGroup = SLSGroup;
    this.selectID = SLSGroup.SLSGroupCode;
    this.SalesGroupFormGroup.get('SalesGroupCode').patchValue(SLSGroup.SLSGroupCode);
    this.SalesGroupFormGroup.get('Description').patchValue(SLSGroup.Description);
    let cstring: string[] = [];
    SLSGroup.CustomerGroupCode.forEach(k => {
      cstring.push(this.AllCustomerGroups.find(l => l.CGID == k).CustomerGroupCode);
    })
    this.SalesGroupFormGroup.get('CGS').patchValue(cstring);
    this.togglePerOne()
  }

  SaveClicked(): void {
    if (this.SalesGroupFormGroup.valid) {
      this.GetSLSGroupValues();
      if (this.SelectedSalesGroup.CreatedBy) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.SalesGroupFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.SalesGroupFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.SalesGroupFormGroup);
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
        Catagory: filename ? filename : 'SLSGroup'
      },
      panelClass: 'confirmation-dialog'
    };
    //console.log(Actiontype);

    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateSLSGroup();
          } else if (Actiontype === 'Update') {
            this.UpdateSLSGroup();
          } else if (Actiontype === 'Delete') {
            this.DeleteSLSGroup();
          }
          else if (Actiontype === ' create the SLSGroups with ') {
            //console.log("BulkFile");

            this._dataMigraton.BulkUploadSalesGroup(this.BulkFile);
            this.GetAllSLSGroups();
          }
        }
      });
  }

  GetSLSGroupValues(): void {
    this.SelectedSalesGroup.SLSGroupCode = this.SalesGroupFormGroup.get('SalesGroupCode').value;
    this.SelectedSalesGroup.Description = this.SalesGroupFormGroup.get('Description').value;
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
  CreateSLSGroup(): void {
    this.SelectedSalesGroup.CreatedBy = this.CurrentUserID.toString();
    let CGID: number[] = [];
    let temp: string[] = this.SalesGroupFormGroup.get('CGS').value;
    temp.forEach(k => {
      if (k != "all")
        CGID.push(this.AllCustomerGroups.find(p => p.CustomerGroupCode == k).CGID);
    })
    this.SelectedSalesGroup.CustomerGroupCode = CGID
    this.IsProgressBarVisibile = true;
    this._masterService.CreateSalesGroup(this.SelectedSalesGroup).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('SalesGroup created successfully', SnackBarStatus.success);
        this.GetAllSLSGroups();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  UpdateSLSGroup(): void {
    this.SelectedSalesGroup.ModifiedBy = this.CurrentUserID.toString();
    let CGID: number[] = [];
    let temp: string[] = this.SalesGroupFormGroup.get('CGS').value;
    temp.forEach(k => {
      if (k != "all")
        CGID.push(this.AllCustomerGroups.find(p => p.CustomerGroupCode == k).CGID);
    })
    this.SelectedSalesGroup.CustomerGroupCode = CGID
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateSalesGroup(this.SelectedSalesGroup).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('SalesGroup updated successfully', SnackBarStatus.success);
        this.GetAllSLSGroups();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  DeleteSLSGroup(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteSalesGroup(this.SelectedSalesGroup).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Organization deleted successfully', SnackBarStatus.success);
        this.GetAllSLSGroups();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  exportAsXLSX() {
    // console.log(this.AllSalesGroups,"Allorg",this.AllCustomerGroups);
    const obj = Object.assign(this.AllSalesGroups);
    // console.log(obj);
    var salesGroups = [];
    this.AllSalesGroups.forEach(item => {
      var temp = new SalesGroupView();
      temp.SLSGroupCode = item.SLSGroupCode;
      temp.CustomerGroupCode = this.ArrayToString(item.CustomerGroupCode);
      temp.Description = item.Description;
      salesGroups.push(temp);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(salesGroups);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelFileName = "SalesGroup"
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    const EXCEL_EXTENSION = ".xlsx"
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
  ArrayToString(arr: any[]): string {
    var str = "";
    arr.forEach((element, i) => {
      if (i < arr.length - 1) {
        str += this.AllCustomerGroups.find(x => x.CGID == element).CustomerGroupCode + ",";
      }
      else {
        str += this.AllCustomerGroups.find(x => x.CGID == element).CustomerGroupCode;
      }
    });
    return str;
  }
}
export class SalesGroupView {
  SLSGroupCode: string;
  CustomerGroupCode: string;
  Description: string;
}



