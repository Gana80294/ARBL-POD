import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { DeleteInvoice, InvoiceHeaderDetail } from "app/models/invoice-details";
import { AuthenticationDetails, UserActionHistory } from "app/models/master";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/snackbar-status-enum";
import { InvoiceService } from "app/services/invoice.service";

@Component({
    selector: "app-delete-invoice",
    templateUrl: "./delete-invoice.component.html",
    styleUrls: ["./delete-invoice.component.scss"],
})
export class DeleteInvoiceComponent implements OnInit {
    DeleteInvoiceFormGroup: FormGroup;
    authenticationDetails: AuthenticationDetails;
    notificationSnackBarComponent: NotificationSnackBarComponent;

    InvoiceData: any;

    constructor(
        private _invoiceService: InvoiceService,
        private _router: Router,
        public snackBar: MatSnackBar
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
    }

    ngOnInit() {
        this.DeleteInvoiceFormGroup = new FormGroup({
            InvoiceNo: new FormControl("", [Validators.required]),
        });
        const retrievedObject = sessionStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
        } else {
            this._router.navigate(["/auth/login"]);
        }
    }

    DeleteInvoice(InvoiceNo: string) {
        let payload = new DeleteInvoice();
        let actionLog = new UserActionHistory();
        actionLog.Action = "Web";
        actionLog.DateTime = new Date();
        actionLog.IpAddress = this.authenticationDetails.ipAddress
            ? this.authenticationDetails.ipAddress
            : "";
        actionLog.Location = this.authenticationDetails.geoLocation
            ? this.authenticationDetails.geoLocation
            : "";
        actionLog.UserName = this.authenticationDetails.userName;
        actionLog.ChangesDetected = `Invoice ${InvoiceNo} deleted by admin`;
        payload.InvNo = InvoiceNo;
        payload.log = actionLog;
        this._invoiceService.DeleteInvoices(payload).subscribe(
            () => {
                this.notificationSnackBarComponent.openSnackBar(
                    "Invoice Deleted Successfully",
                    SnackBarStatus.success
                );
            },
            (err) => {
                var message =
                    err instanceof Object
                        ? err.ExceptionMessage
                            ? err.ExceptionMessage
                            : "Something went wrong"
                        : err;
                this.notificationSnackBarComponent.openSnackBar(
                    message,
                    SnackBarStatus.danger
                );
            }
        );
    }

    SearchInvoice(InvoiceNo: string) {
        this._invoiceService.SearchInvoices(InvoiceNo).subscribe({
            next: (data) => { 
                console.log(data);
                this.InvoiceData = data;
            },
            error: (err) => { }
        });
    }
}
