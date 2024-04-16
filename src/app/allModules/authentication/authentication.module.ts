import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    MatSelectModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LinkForForgetPasswordComponent } from './link-for-forget-password/link-for-forget-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgetPasswordLinkDialogComponent } from './forget-password-link-dialog/forget-password-link-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { ChangePasswordUsingSMSOTPComponent } from './change-password-using-smsotp/change-password-using-smsotp.component';

const authRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'changePassword',
        component: ChangePasswordComponent
    },
    {
        path: 'forgotPassword',
        component: ForgotPasswordComponent
    },
    {
        path: 'linkForgotPassword',
        component: LinkForForgetPasswordComponent
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];

@NgModule({
    declarations: [
        LoginComponent,
        ChangePasswordComponent,
        ForgotPasswordComponent,
        LinkForForgetPasswordComponent,
        ChangePasswordDialogComponent,
        ForgetPasswordLinkDialogComponent,
        ChangePasswordUsingSMSOTPComponent
    ],
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        FuseSharedModule,
        MatDialogModule,
        MatIconModule,
        MatSelectModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        RouterModule.forChild(authRoutes)
    ],
    entryComponents: [
        ChangePasswordDialogComponent,
        ForgetPasswordLinkDialogComponent,
        ChangePasswordUsingSMSOTPComponent
    ]
})
export class AuthenticationModule {
}
