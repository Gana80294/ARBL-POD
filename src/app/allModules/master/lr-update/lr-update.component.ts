import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-lr-update',
  templateUrl: './lr-update.component.html',
  styleUrls: ['./lr-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LrUpdateComponent implements OnInit {
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  UpdateLRFormGroup: FormGroup;
  UpdateLRNumberFormGroup: FormGroup;
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _datePipe: DatePipe
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit() {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.userName;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('LRUpdate') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.UpdateLRFormGroup = this._formBuilder.group({
      InvoiceNo: ['', Validators.required],
      LRDate: ['', Validators.required]
    });
    this.UpdateLRNumberFormGroup = this._formBuilder.group({
      InvoiceNo: ['', Validators.required],
      LRNumber: ['', Validators.required]
    });
  }

  SaveClicked(mode: string) {
    if (mode == 'number') {
      if (this.UpdateLRNumberFormGroup.valid) {
        this.OpenConfirmationDialog("update", "LR Number");
      }
      else {
        this.ShowValidationErrors(this.UpdateLRNumberFormGroup);
      }
    }
    else if ('date') {
      if (this.UpdateLRFormGroup.valid) {
        this.OpenConfirmationDialog("update", "LR Date");
      }
      else {
        this.ShowValidationErrors(this.UpdateLRFormGroup);
      }
    }
  }

  UpdateLRDate() {
    var InvoiceNo = this.UpdateLRFormGroup.get('InvoiceNo').value;
    var LRDate = null;
    const lrDate = this.UpdateLRFormGroup.get('LRDate').value;
    if (lrDate) {
      LRDate = this._datePipe.transform(lrDate, 'yyyy-MM-dd');
    }
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateLRDateByInvoiceNo({ InvoiceNo: InvoiceNo, LRDate: LRDate }).subscribe(() => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar("LR Date updated successfully", SnackBarStatus.success);
    },
      err => {
        this.IsProgressBarVisibile = false;
        console.log(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? err.Message : err, SnackBarStatus.danger);
      });
  }

  UpdateLRNumber() {
    var InvoiceNo = this.UpdateLRNumberFormGroup.get('InvoiceNo').value;
    var LRNumber = this.UpdateLRNumberFormGroup.get('LRNumber').value;
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateLRNumberByInvoiceNo({ InvoiceNo: InvoiceNo, LRNumber: LRNumber }).subscribe(() => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar("LR Number updated successfully", SnackBarStatus.success);
    },
      err => {
        this.IsProgressBarVisibile = false;
        console.log(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? err.Message : err, SnackBarStatus.danger);
      });
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

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Catagory == 'LR Date') {
            this.UpdateLRDate();
          }
          else if (Catagory == 'LR Number') {
            this.UpdateLRNumber();
          }
        }
      });
  }

  decimalOnly(event): boolean {
    // this.AmountSelected();
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }
}
