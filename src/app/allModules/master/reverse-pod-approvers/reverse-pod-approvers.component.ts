import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { AuthenticationDetails, UserWithRole } from "app/models/master";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/snackbar-status-enum";
import { MasterService } from "app/services/master.service";
import { ReversePodService } from "app/services/reverse-pod.service";

@Component({
    selector: "app-reverse-pod-approvers",
    templateUrl: "./reverse-pod-approvers.component.html",
    styleUrls: ["./reverse-pod-approvers.component.scss"],
})
export class ReversePodApproversComponent implements OnInit {
    approvers: FormControl = new FormControl();
    AllUsers: UserWithRole[] = [];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    MenuItems: string[];
    authenticationDetails: AuthenticationDetails;
    constructor(
        private _master: MasterService,
        private _reversePod: ReversePodService,
        private _router: Router,
        public snackBar: MatSnackBar
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
    }

    ngOnInit() {
        const retrievedObject = sessionStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.MenuItems =
                this.authenticationDetails.menuItemNames.split(",");
            if (this.MenuItems.indexOf("UnlockUser") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }

            this.getAllDcUsers();
        } else {
            this._router.navigate(["/auth/login"]);
        }
    }

    getAllDcUsers() {
        this._master.GetAllDCUsers().subscribe({
            next: (data) => {
                this.AllUsers = <UserWithRole[]>data;
                this.getDcApprovers();
            },
            error: (err) => {},
        });
    }

    getDcApprovers() {
        this._reversePod.GetDcApprovers().subscribe({
            next: (res) => {
                if (res) this.approvers.patchValue(res);
            },
        });
    }

    Update() {
        this._reversePod
            .UpdateReversePodApprover(this.approvers.value)
            .subscribe({
                next: (res) => {
                    console.log("Updated");
                },
            });
    }
}
