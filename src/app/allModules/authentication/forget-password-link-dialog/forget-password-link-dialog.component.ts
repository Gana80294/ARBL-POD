import { Component, OnInit, ViewEncapsulation, Inject, isDevMode } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EMailModel, ForgotPasswordModel, OutputOTPBody, resetPasswordOTPBody } from 'app/models/master';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { WINDOW } from 'app/window.providers';
import { fdatasync } from 'fs';
import { fakeAsync } from '@angular/core/testing';

// import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-forget-password-link-dialog',
  templateUrl: './forget-password-link-dialog.component.html',
  styleUrls: ['./forget-password-link-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ForgetPasswordLinkDialogComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  Origin: string;
  OutPutModel: EMailModel | OutputOTPBody;
  hidephone=true;
  hideemail=false;
  forgotPasswordModel:ForgotPasswordModel = new ForgotPasswordModel();
  modelist = ['Phone','Email']
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(
    public matDialogRef: MatDialogRef<ForgetPasswordLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    @Inject(WINDOW) private window: Window
) {
    this.forgotPasswordForm = this._formBuilder.group({
      username:['',Validators.required],
      
      mode:['Email',Validators.required]
      // UserName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // if (isDevMode()) {
    //   this.Origin = this.window.location.origin;
    // } else {
    //   this.Origin = this.window.location.origin;
   // this.forgotPasswordForm.get('phone').clearValidators();
    
    // }
    this.Origin = this.window.location.origin;
  }
  
  YesClicked(): void {

    
    if (this.forgotPasswordForm.valid) {
      this.forgotPasswordModel.UserName = this.forgotPasswordForm.get("username").value;
      this.forgotPasswordModel.mode = this.forgotPasswordForm.get("mode").value;
      this.matDialogRef.close(this.forgotPasswordModel);
      

    } else {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        this.forgotPasswordForm.get(key).markAsTouched();
        this.forgotPasswordForm.get(key).markAsDirty();
      });

    }
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }

}
