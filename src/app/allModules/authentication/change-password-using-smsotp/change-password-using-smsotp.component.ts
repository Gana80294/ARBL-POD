import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { AffrimativeOTPBody, EMailModel, OTPResponseBody, OutputOTPBody } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { CustomValidator } from 'app/shared/custom-validator';
import { WINDOW } from 'app/window.providers';
import { ForgetPasswordLinkDialogComponent } from '../forget-password-link-dialog/forget-password-link-dialog.component';

@Component({
  selector: 'app-change-password-using-smsotp',
  templateUrl: './change-password-using-smsotp.component.html',
  styleUrls: ['./change-password-using-smsotp.component.scss']
})
export class ChangePasswordUsingSMSOTPComponent implements OnInit {
  OTPPasswordForm: FormGroup;
  Origin: string;
  OutPutModel: EMailModel | OutputOTPBody;
  OTPinfo:OTPResponseBody ;
  hidephone=true;
  hideemail=false;
  modelist = ['Phone','Email']
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(
    public matDialogRef: MatDialogRef<ChangePasswordUsingSMSOTPComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    
    private _authService: AuthService,
    @Inject(WINDOW) private window: Window

  ) {
    this.OTPPasswordForm = this._formBuilder.group({
      otp:['',[Validators.required,Validators.maxLength(6),Validators.minLength(6)]],
      
      newpassword:['',[Validators.required,Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,15}$')]],
      confirmpassword:['',[Validators.required, CustomValidator.confirmPasswordValidator]]
      // UserName: ['', Validators.required]
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.OTPinfo = this.data;
    console.log(this.OTPinfo);
    
  }

  ngOnInit(): void {
    // if (isDevMode()) {
    //   this.Origin = this.window.location.origin;
    // } else {
    //   this.Origin = this.window.location.origin;
    
    // }
    this.Origin = this.window.location.origin;
  }
  
  YesClicked(): void {
    if (this.OTPPasswordForm.valid) {
      let d :  AffrimativeOTPBody = new AffrimativeOTPBody();
      d.OTPTransID = this.OTPinfo.OTPtranID;
      d.UserGuid = this.OTPinfo.UserGuid;
      d.newPassword = this.OTPPasswordForm.get('newpassword').value;
      d.recievedOTP = this.OTPPasswordForm.get('otp').value;
      this._authService.changePasswordWithSMSOTP(d).subscribe(k=>{
        if(k=="Success"){
          this.notificationSnackBarComponent.openSnackBar("Password Reset Successfull..",SnackBarStatus.success)
this.matDialogRef.close()
        }
        else{
       this.notificationSnackBarComponent.openSnackBar(k,SnackBarStatus.danger);
        }
      },err=>{
        this.notificationSnackBarComponent.openSnackBar(err,SnackBarStatus.danger);
        this.matDialogRef.close();
      })

    } else {
      Object.keys(this.OTPPasswordForm.controls).forEach(key => {
        this.OTPPasswordForm.get(key).markAsTouched();
        this.OTPPasswordForm.get(key).markAsDirty();
      });

    }
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }

}

