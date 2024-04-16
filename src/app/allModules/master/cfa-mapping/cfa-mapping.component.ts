import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { DataMigration } from 'app/services/DataMigration.service';
import { MasterService } from 'app/services/master.service';
import { ProgressBarBehaviourSubject } from 'app/services/ProgressBarBehaviourSubject.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-cfa-mapping',
  templateUrl: './cfa-mapping.component.html',
  styleUrls: ['./cfa-mapping.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CfaMappingComponent implements OnInit {

  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  searchText: string;
  AllCFAMaps = [];
  Selected;
  BulkFile: File;
  cfaFormGroup: FormGroup;
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _dataMigraton: DataMigration,
    private progbrBhvrsbjct: ProgressBarBehaviourSubject
  ) { }

  ngOnInit() {
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.userName;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('CFAMaps') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  SaveClicked(): void {
    if (this.cfaFormGroup.valid) {
      // this.GetSLSGroupValues();
      if (this.cfaFormGroup) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.cfaFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.cfaFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.cfaFormGroup);
    }
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        //console.log(key);
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
                //console.log(key2);
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

  BulkUpload(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.BulkFile = target.files[0];
    this.OpenConfirmationDialog(" create the SLSGroups with ", this.BulkFile.name);
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
            // this.CreateSLSGroup();
          } else if (Actiontype === 'Update') {
            // this.UpdateSLSGroup();
          } else if (Actiontype === 'Delete') {
            // this.DeleteSLSGroup();
          }
          else if (Actiontype === ' create the SLSGroups with ') {
            //console.log("BulkFile");

            this._dataMigraton.BulkUploadSalesGroup(this.BulkFile);
            // this.GetAllSLSGroups();
          }
        }
      });
  }
}
