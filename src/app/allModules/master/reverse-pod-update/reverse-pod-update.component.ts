import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { UpdateReverseLogistics } from 'app/models/invoice-details';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import { ReversePodService } from 'app/services/reverse-pod.service';
import { error } from 'console';

@Component({
  selector: 'app-reverse-pod-update',
  templateUrl: './reverse-pod-update.component.html',
  styleUrls: ['./reverse-pod-update.component.scss']
})
export class ReversePodUpdateComponent implements OnInit {

  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;

  UpdateReverseLogisticsFormGroup: FormGroup;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;

  constructor(
    private _reverseLogistics: ReversePodService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _datePipe: DatePipe
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit() {
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('LRUpdate') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.UpdateReverseLogisticsFormGroup = this._formBuilder.group({
      DC_NUMBER: ['', Validators.required],
      LR_NO: [],
      LR_DATE: [],
      HAND_OVERED_QUANTITY: [0],
      RECEIVED_QUANTITY: [0],
      DC_RECEIEVED_DATE: []
    });
  }


  UpdateClicked() {
    console.log("1", this.UpdateReverseLogisticsFormGroup);
    if (this.UpdateReverseLogisticsFormGroup.valid) {
      let payLoad = new UpdateReverseLogistics();
      payLoad = this.UpdateReverseLogisticsFormGroup.value;
      if(payLoad.DC_RECEIEVED_DATE != null && payLoad.DC_RECEIEVED_DATE!=""){
        payLoad.DC_RECEIEVED_DATE = this._datePipe.transform(payLoad.DC_RECEIEVED_DATE,"yyyy-MM-dd HH:mm:ss")
      }
      if(payLoad.LR_DATE != null && payLoad.LR_DATE!=""){
        payLoad.LR_DATE = this._datePipe.transform(payLoad.LR_DATE,"yyyy-MM-dd HH:mm:ss")
      }
      this.IsProgressBarVisibile = true;
      this._reverseLogistics.UpdateReversePodAsAdmin(payLoad).subscribe({
        next: (res) => {
          this.IsProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar("Reverse Logistics details updated successfully!", SnackBarStatus.success);
        },
        error: (err) => {
          this.IsProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? "Something went wroing!" : err, SnackBarStatus.danger);
        }
      })
    }
    else {
      this.ShowValidationErrors(this.UpdateReverseLogisticsFormGroup);
    }
  }

  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
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
}
