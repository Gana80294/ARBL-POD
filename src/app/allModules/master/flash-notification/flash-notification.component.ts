import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationDetails, ScrollNotification } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-flash-notification',
  templateUrl: './flash-notification.component.html',
  styleUrls: ['./flash-notification.component.scss']
})
export class FlashNotificationComponent implements OnInit {
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  NotificationFormGroup: FormGroup;
  ReverseLogisticsNotificationFormGroup: FormGroup;
  FlashNotification: ScrollNotification = new ScrollNotification();
  FlashNotifications: ScrollNotification[] = [];

  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _datePipe: DatePipe,
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
      if (this.MenuItems.indexOf('ScrollNotification') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.NotificationFormGroup = this._formBuilder.group({
      Message: ['', Validators.required],
      IsActive: false
    });

    this.ReverseLogisticsNotificationFormGroup = this._formBuilder.group({
      Message: ['', Validators.required],
      IsActive: false
    });
    this.GetNotification();
  }

  GetNotification() {
    this._masterService.GetScrollNotification().subscribe(res => {
      this.FlashNotifications = res as ScrollNotification[];
      this.FlashNotifications.forEach((ele) => {
        if (ele.Code == 1) {
          this.NotificationFormGroup.patchValue({
            Message: ele.Message,
            IsActive: ele.IsActive
          });
        }
        else if (ele.Code == 2) {
          this.ReverseLogisticsNotificationFormGroup.patchValue({
            Message: ele.Message,
            IsActive: ele.IsActive
          });
        }
      })

    });
  }

  SaveClicked(code: string) {

    if (code == "1") {
      if (this.NotificationFormGroup.valid) {
        this.OpenConfirmationDialog("save", "notification", code);
      }
      else {
        this.ShowValidationErrors(this.NotificationFormGroup);
      }
    }
    else if (code == "2") {
      if (this.ReverseLogisticsNotificationFormGroup.valid) {
        this.OpenConfirmationDialog("save", "notification", code);
      }
      else {
        this.ShowValidationErrors(this.ReverseLogisticsNotificationFormGroup);
      }
    }
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string, code: string): void {
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
          this.SaveScrollNotification(code);
        }
      });
  }

  SaveScrollNotification(code: string) {
    if (code == "1") {
      this.FlashNotification.Message = this.NotificationFormGroup.get('Message').value;
      this.FlashNotification.IsActive = this.NotificationFormGroup.get('IsActive').value;
      this.FlashNotification.Code = 1;
    }
    else if (code == "2") {
      this.FlashNotification.Message = this.ReverseLogisticsNotificationFormGroup.get('Message').value;
      this.FlashNotification.IsActive = this.ReverseLogisticsNotificationFormGroup.get('IsActive').value;
      this.FlashNotification.Code = 2;
    }

    this.IsProgressBarVisibile = true;
    this._masterService.SaveScrollNotification(this.FlashNotification).subscribe(() => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar("Notification saved successfully", SnackBarStatus.success);
    }, err => {
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
}
