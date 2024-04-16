import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    Inject,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { Observable, Subject } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth.service";
import { WINDOW } from "app/window.providers";
// import { LoginService } from 'app/services/login.service';
// import { UserDetails } from 'app/models/user-details';
import { MatDialog, MatSnackBar, MatDialogConfig } from "@angular/material";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { FuseNavigationService } from "@fuse/components/navigation/navigation.service";
import { FuseNavigation } from "@fuse/types";
import { MenuUpdataionService } from "app/services/menu-update.service";
import {
    AuthenticationDetails,
    ChangePassword,
    EMailModel,
    ForgotPasswordModel,
    geoLocation,
    OTPResponseBody,
    OutputOTPBody,
    resetPasswordOTPBody,
    RolewithGroup,
} from "app/models/master";
import { ChangePasswordDialogComponent } from "../change-password-dialog/change-password-dialog.component";
import { ForgetPasswordLinkDialogComponent } from "../forget-password-link-dialog/forget-password-link-dialog.component";
import { ChangePasswordUsingSMSOTPComponent } from "../change-password-using-smsotp/change-password-using-smsotp.component";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    navigation: FuseNavigation[] = [];
    authenticationDetails: AuthenticationDetails;
    MenuItems: string[];
    forwardMenuItems: FuseNavigation[] = [];
    reverseMenuItems: FuseNavigation[] = [];
    children: FuseNavigation[] = [];
    UserChldren: FuseNavigation[] = [];
    subChildren: FuseNavigation[] = [];
    AMChildren: FuseNavigation[] = [];
    CustomerChildren: FuseNavigation[] = [];

    private _unsubscribeAll: Subject<any>;
    message = "Snack Bar opened.";
    actionButtonLabel = "Retry";
    action = true;
    setAutoHide = true;
    autoHide = 2000;
    otpresponseBody: OTPResponseBody;
    addExtraClass: false;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _authService: AuthService,
        private _menuUpdationService: MenuUpdataionService,
        private _httpClient: HttpClient,
        // private _loginService: LoginService,

        @Inject(WINDOW) private window: Window,
        public dialog: MatDialog,
        public snackBar: MatSnackBar
    ) {
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true,
                },
                toolbar: {
                    hidden: true,
                },
                footer: {
                    hidden: true,
                },
                sidepanel: {
                    hidden: true,
                },
            },
        };

        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.IsProgressBarVisibile = false;
    }

    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            userName: ["", Validators.required],
            password: ["", Validators.required],
        });
    }

    LoginClicked(): void {
        if (this.loginForm.valid) {
            this.IsProgressBarVisibile = true;
            this._authService
                .login(
                    this.loginForm.get("userName").value,
                    this.loginForm.get("password").value
                )
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        const dat = data as AuthenticationDetails;
                        this.getLocation()
                            .then((response) => {
                                this._httpClient
                                    .get("https://api.ipify.org/?format=json")
                                    .subscribe((res: any) => {
                                        dat.ipAddress = res.ip;
                                        dat.geoLocation =
                                            JSON.stringify(response);
                                        if (
                                            data.isChangePasswordRequired ===
                                            "Yes"
                                        ) {
                                            this.OpenChangePasswordDialog(dat);
                                        } else {
                                            this.saveUserDetails(dat);
                                        }
                                    });
                            })
                            .catch((err) => {
                                this._httpClient
                                    .get("https://api.ipify.org/?format=json")
                                    .subscribe((res: any) => {
                                        dat.ipAddress = res.ip;
                                        dat.geoLocation = "-";
                                        if (
                                            data.isChangePasswordRequired ===
                                            "Yes"
                                        ) {
                                            this.OpenChangePasswordDialog(dat);
                                        } else {
                                            this.saveUserDetails(dat);
                                        }
                                    });
                            });
                    },
                    (err) => {
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            Object.keys(this.loginForm.controls).forEach((key) => {
                const abstractControl = this.loginForm.get(key);
                abstractControl.markAsDirty();
            });
        }
    }

    getLocation(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (position) {
                            const Location = new geoLocation();
                            Location.latitude = position.coords.latitude;
                            Location.longitude = position.coords.longitude;
                            resolve(Location);
                        }
                    },
                    (error) => {
                        reject(String(error));
                    }
                );
            } else {
                alert("Geolocation is not supported by this browser.");
                reject("");
            }
        });
    }

    saveUserDetails(data: AuthenticationDetails): void {
        //console.log("UserData ", data);
        sessionStorage.setItem("authorizationData", JSON.stringify(data));
        this.UpdateMenu();
        this.notificationSnackBarComponent.openSnackBar(
            "Logged in successfully",
            SnackBarStatus.success
        );
        if (data.userRole === "Administrator") {
            this._router.navigate(["master/user"]);
        } else if (
            data.userRole === "Customer" ||
            data.userRole === "Amararaja User"
        ) {
            this._router.navigate(["pages/home"]);
        } else {
            this._router.navigate(["pages/forwardLogistics"]);
        }
    }

    OpenChangePasswordDialog(data: AuthenticationDetails): void {
        const dialogConfig: MatDialogConfig = {
            data: null,
            panelClass: "change-password-dialog",
        };
        const dialogRef = this.dialog.open(
            ChangePasswordDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const changePassword = result as ChangePassword;
                changePassword.UserID = data.userID;
                changePassword.UserName = data.userName;
                this._authService.ChangePassword(changePassword).subscribe(
                    (res) => {
                        // console.log(res);
                        // this.notificationSnackBarComponent.openSnackBar('Password updated successfully', SnackBarStatus.success);
                        this.notificationSnackBarComponent.openSnackBar(
                            "Password updated successfully, please log with new password",
                            SnackBarStatus.success
                        );
                        this._router.navigate(["/auth/login"]);
                    },
                    (err) => {
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                        this._router.navigate(["/auth/login"]);
                        console.error(err);
                    }
                );
            }
        });
    }

    OpenForgetPasswordLinkDialog(): void {
        const dialogConfig: MatDialogConfig = {
            data: null,
            panelClass: "forget-password-link-dialog",
        };
        const dialogRef = this.dialog.open(
            ForgetPasswordLinkDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result: ForgotPasswordModel) => {
            //console.log(result);

            if (result.mode == "Phone") {
                this.IsProgressBarVisibile = true;
                let d: resetPasswordOTPBody = new resetPasswordOTPBody();

                d.UserName = result.UserName;
                this._authService.sendSMSforOTP(d).subscribe(
                    (kl) => {
                        this.otpresponseBody = kl as OTPResponseBody;
                        const dialogConfig: MatDialogConfig = {
                            data: this.otpresponseBody,
                            panelClass: "SMS-OTP-dailog",
                        };
                        const dialogRef = this.dialog.open(
                            ChangePasswordUsingSMSOTPComponent,
                            dialogConfig
                        );

                        dialogRef.afterClosed().subscribe(() => {
                            this.IsProgressBarVisibile = false;
                        });
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                        console.error(err);
                    }
                );
            } else {
                let d = new EMailModel();
                d.UserName = result.UserName;
                d.siteURL =
                    this.window.location.origin + "/#/auth/forgotPassword";
                this.IsProgressBarVisibile = true;
                this._authService.SendResetLinkToMail(d).subscribe(
                    (data) => {
                        const res = data as string;
                        this.notificationSnackBarComponent.openSnackBar(
                            res,
                            SnackBarStatus.success
                        );
                        // this.notificationSnackBarComponent.openSnackBar(`Reset password link sent successfully to ${emailModel.EmailAddress}`, SnackBarStatus.success);
                        // this.ResetControl();
                        this.IsProgressBarVisibile = false;
                        // this._router.navigate(['auth/login']);
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                        console.error(err);
                    }
                );
            }
        });
    }

    UpdateMenu(): void {
        const retrievedObject = sessionStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.MenuItems =
                this.authenticationDetails.menuItemNames.split(",");
            // console.log(this.MenuItems);
        } else {
        }



        if (this.MenuItems.indexOf("ForwardLogistics") >= 0) {
            this.forwardMenuItems.push({
                id: "ForwardLogistics",
                title: "Dashboard",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "dashboardIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                url: "/pages/forwardLogistics",
            });
        }
        if (this.MenuItems.indexOf("InvoiceDetails") >= 0) {
            this.forwardMenuItems.push({
                id: "invoiceDetails",
                title: "Invoices",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "receiptIcon",
                isSvgIcon: true,
                // icon: 'receipt',
                url: "/pages/invoices",
            });
        }
        if (this.MenuItems.indexOf("SavedInvoice") >= 0) {
            this.forwardMenuItems.push({
                id: "savedinvoice",
                title: "Saved Invoices",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "receiptIcon",
                isSvgIcon: true,
                // icon: 'receipt',
                url: "/pages/savedinvoice",
            });
        }
        if (this.MenuItems.indexOf("PartiallyConfirmedInvoice") >= 0) {
            this.children.push({
                id: "partialinvoice",
                title: "Partial Confirmed Invoices",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "receiptlongIcon",
                isSvgIcon: true,
                // icon: 'receipt',
                url: "/pages/partialinvoice",
            });
        }
        if (this.MenuItems.indexOf("DeliveryComplianceReport") >= 0) {
            this.forwardMenuItems.push({
                id: "deliveryComplianceReport",
                title: "Report",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "assignmentIcon",
                isSvgIcon: true,
                // icon: 'assignment',
                url: "/reports/delivery",
            });
        }

        if (this.MenuItems.indexOf("DocumentHistory") >= 0) {
            this.children.push({
                id: "DocumentHistory",
                title: "Document History",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "assignmentIcon",
                isSvgIcon: true,
                // icon: 'assignment',
                url: "/reports/document-history",
            });
        }

        if (this.MenuItems.indexOf("ReversePOD") >= 0) {
            this.reverseMenuItems.push({
                id: "reversepod",
                title: "Dashboard",
                translate: "NAV.SAMPLE.TITLE",
                type: "item",
                icon: "dashboardIcon",
                isSvgIcon: true,
                // icon: 'receipt',
                url: "/pages/reverseLogistics",
            });
        }

        if (this.MenuItems.indexOf("DeliveryChallan") >= 0) {
            this.reverseMenuItems.push({
                id: "DeliveryChallan",
                title: "Delivery Challan",
                type: "item",
                icon: "receiptIcon",
                isSvgIcon: true,
                url: "/pages/deliverychallan",
            });
        }

        if (this.MenuItems.indexOf("App") >= 0) {
            this.subChildren.push({
                id: "menuapp",
                title: "App",
                type: "item",
                url: "/master/menuApp",
            });
        }
        if (this.MenuItems.indexOf("Role") >= 0) {
            this.subChildren.push({
                id: "role",
                title: "Role",
                type: "item",
                url: "/master/role",
            });
        }
        if (this.MenuItems.indexOf("User") >= 0) {
            this.subChildren.push({
                id: "user",
                title: "User",
                type: "item",
                url: "/master/user",
            });
        }
        if (this.MenuItems.indexOf("Organization") >= 0) {
            this.subChildren.push({
                id: "organization",
                title: "Organization",
                type: "item",
                url: "/master/organization",
            });
        }
        if (this.MenuItems.indexOf("Plant") >= 0) {
            this.subChildren.push({
                id: "plant",
                title: "Plant",
                type: "item",
                url: "/master/plant",
            });
        }
        if (this.MenuItems.indexOf("Reason") >= 0) {
            this.subChildren.push({
                id: "reason",
                title: "Reason",
                type: "item",
                url: "/master/reason",
            });
        }

        if (this.MenuItems.indexOf("CustomerGroup") >= 0) {
            this.subChildren.push({
                id: "CustomerGroup",
                title: "CustomerGroup",
                type: "item",
                url: "/master/customergroup",
            });
        }
        if (this.MenuItems.indexOf("SalesGroup") >= 0) {
            this.subChildren.push({
                id: "SalesGroup",
                title: "SalesGroup",
                type: "item",
                url: "/master/salesgroup",
            });
        }
        if (this.MenuItems.indexOf("LRUpdate") >= 0) {
            this.subChildren.push({
                id: "LRUpdate",
                title: "LR Update",
                type: "item",
                url: "/master/lr-update",
            });
        }
        if (this.MenuItems.indexOf("CFAMaps") >= 0) {
            this.subChildren.push({
                id: "CFAMaps",
                title: "CFA Mapping",
                type: "item",
                url: "/master/cfamap",
            });
        }
        if (this.MenuItems.indexOf("ActionLog") >= 0) {
            this.subChildren.push({
                id: "ActionLog",
                title: "Action History",
                type: "item",
                url: "/master/actionLog",
            });
        }
        if (this.MenuItems.indexOf("ScrollNotification") >= 0) {
            this.subChildren.push({
                id: "ScrollNotification",
                title: "Notification",
                type: "item",
                url: "/master/notification",
            });
        }
        if (this.MenuItems.indexOf("upload") >= 0) {
            this.subChildren.push({
                id: "upload",
                title: "upload",
                type: "item",
                isSvgIcon: true,
                url: "/master/upload",
            });
        }
        if (this.MenuItems.indexOf("DeleteInvoice") >= 0) {
            this.subChildren.push({
                id: "menuapp",
                title: "Delete Invoice",
                type: "item",
                url: "/master/delete-invoice",
            });
        }
        if (this.MenuItems.indexOf("UserManual") >= 0 && this.authenticationDetails.userRole == "Administrator") {
            this.subChildren.push({
                id: "menuapp",
                title: "User Manual",
                type: "item",
                url: "/master/user-manual",
            });
        }
        if (this.MenuItems.indexOf("UserManual") >= 0 && this.authenticationDetails.userRole != "Administrator") {
            this.reverseMenuItems.push({
                id: "menuapp",
                title: "User Manual",
                type: "item",
                icon: "viewListIcon",
                isSvgIcon: true,
                url: "/master/user-manual",
            });
            this.forwardMenuItems.push({
                id: "menuapp",
                title: "User Manual",
                type: "item",
                icon: "viewListIcon",
                isSvgIcon: true,
                url: "/master/user-manual",
            });
        }
        if (this.MenuItems.indexOf("ReversePODApprover") >= 0) {
            this.subChildren.push({
                id: "ReversePODApprover",
                title: "Reverse Logistics Approvers",
                type: "item",
                url: "/master/rpod-approver",
            });
        }
        if (this.MenuItems.indexOf("UnlockUser") >= 0) {
            this.subChildren.push({
                id: "UnlockUser",
                title: "Unlock User",
                type: "item",
                url: "/master/unlock-user",
            });
        }
        if (this.MenuItems.indexOf("ReverseLogisticsUpdate") >= 0) {
            this.subChildren.push({
                id: "ReverseLogisticsUpdate",
                title: "Reverse Logistics Update",
                type: "item",
                url: "/master/rpod-update",
            });
        }

        if (
            this.MenuItems.indexOf("App") >= 0 ||
            this.MenuItems.indexOf("Role") >= 0 ||
            this.MenuItems.indexOf("User") >= 0 ||
            this.MenuItems.indexOf("Reason") >= 0 ||
            this.MenuItems.indexOf("CustomerGroup") >= 0 ||
            this.MenuItems.indexOf("SalesGroup") >= 0 ||
            this.MenuItems.indexOf("LRUpdate") >= 0 ||
            this.MenuItems.indexOf("CFAMaps") >= 0 ||
            this.MenuItems.indexOf("ScrollNotification") >= 0 ||
            this.MenuItems.indexOf("upload") >= 0 ||
            this.MenuItems.indexOf("DeleteInvoice") >= 0 ||
            (this.MenuItems.indexOf("UserManual") >= 0 &&
                this.authenticationDetails.userRole == "Administrator") ||
            this.MenuItems.indexOf("ReversePODApprover") >= 0 ||
            this.MenuItems.indexOf("ReverseLogisticsUpdate") >= 0 ||
            this.MenuItems.indexOf("UnlockUser") >= 0
        ) {
            this.children.push({
                id: "master",
                title: "Master",
                // translate: 'NAV.DASHBOARDS',
                type: "collapsable",
                icon: "viewListIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.subChildren,
            });
        }
        if (this.authenticationDetails.userRole != "Customer" && this.authenticationDetails.userRole != "Amararaja User")
            this.navigation.push({
                id: "applications",
                title: "Applications",
                translate: "NAV.APPLICATIONS",
                type: "group",
                children: this.children,
            });

        if (this.authenticationDetails.userRole == "Customer" || this.authenticationDetails.userRole == "Amararaja User") {
            this.navigation.push({
                id: "forward",
                title: "Forward Logistics",
                type: "group",
                children: this.forwardMenuItems,
            });

            this.navigation.push({
                id: "reverse",
                title: "Reverse Logistics",
                type: "group",
                children: this.reverseMenuItems,
            });
        }

        if(this.authenticationDetails.userRole == "Coordinator User"){
            this.navigation.push({
                id: "forward",
                title: "Forward Logistics",
                type: "group",
                children: this.forwardMenuItems,
            });
        }

        // Saving local Storage
        sessionStorage.setItem(
            "menuItemsData",
            JSON.stringify(this.navigation)
        );
        // Update the service in order to update menu
        this._menuUpdationService.PushNewMenus(this.navigation);
    }
}
