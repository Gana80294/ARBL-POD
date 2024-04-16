import { LiveAnnouncer } from "@angular/cdk/a11y";
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    MatPaginator,
    MatSnackBar,
    MatSort,
    MatTableDataSource,
    Sort,
} from "@angular/material";
import {
    ActionHistoryFilter,
    UserActionHistory,
    UserActionHistoryView,
} from "app/models/master";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/snackbar-status-enum";
import { InvoiceService } from "app/services/invoice.service";
import { saveAs } from "file-saver";

export interface ActionLog {
    UserName: string;
    IpAddress: string;
    Location: object;
    TransID: number;
    Action: string;
    ChangesDetected: object;
    DateTime: string;
}

@Component({
    selector: "app-log-admin",
    templateUrl: "./log-admin.component.html",
    styleUrls: ["./log-admin.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class LogAdminComponent implements OnInit {
    displayedColumns: string[] = [
        "UserName",
        "IpAddress",
        "Location",
        "Action",
        "InvoiceNumber",
        "ChangesDetected",
        "DateTime",
    ];
    dataSource = new MatTableDataSource<UserActionHistoryView>([]);
    ActionForm: FormGroup;
    isDateError: boolean = false;
    logData: UserActionHistoryView[] = [];
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    IsProgressBarVisibile: boolean = false;
    endDatechk: Date = new Date();
    fromDate;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    constructor(
        private _fb: FormBuilder,
        private _liveAnnouncer: LiveAnnouncer,
        private _service: InvoiceService,
        private _datePipe: DatePipe,
        public snackBar: MatSnackBar
    ) {
        var currDate = new Date();
        currDate.setMonth(currDate.getMonth() - 1);
        this.fromDate = currDate.toISOString().slice(0, 10);
        this.ActionForm = this._fb.group({
            StartDate: [this.fromDate],
            EndDate: [this.endDatechk],
            InvoiceNumber: [],
            Username: [],
        });
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
    }

    ngOnInit() {
        this.filterUserActionHistories();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    filterUserActionHistories() {
        this.IsProgressBarVisibile = true;
        console.log(this.ActionForm);
        var filter = this.ActionForm.value as ActionHistoryFilter;
        filter.StartDate = this._datePipe.transform(filter.StartDate, "yyyy-MM-dd ");
        filter.EndDate = this._datePipe.transform(filter.EndDate, "yyyy-MM-dd");
        console.log(filter);
        this._service.FilterUserActionHistories(filter).subscribe((data) => {
            this.logData = data;
            this.dataSource = new MatTableDataSource(this.logData);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.IsProgressBarVisibile = false;
        });
    }

    DateSelected(): void {
        const FROMDATEVAL = this.ActionForm.get("StartDate").value as Date;
        const TODATEVAL = this.ActionForm.get("EndDate").value as Date;
        if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
            this.isDateError = true;
        } else {
            this.isDateError = false;
        }
    }
    onKeydown(event): boolean {
        if (event.key === "Backspace" || event.key === "Delete") {
            return true;
        } else {
            return false;
        }
    }

    announceSortChange(sortState: Sort) {
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
            this._liveAnnouncer.announce("Sorting cleared");
        }
    }

    SearchInvoices() {
        this.filterUserActionHistories();
    }

    exportAllAsXLSX(): void {
        var filter = this.ActionForm.value as ActionHistoryFilter;
        this._service.DownloadUserActionHistory(filter).subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                const BlobFile = data as Blob;
                const currentDateTime = this._datePipe.transform(
                    new Date(),
                    "ddMMyyyyHHmmss"
                );
                const fileName = "Invoice details";
                const EXCEL_EXTENSION = ".xlsx";
                saveAs(
                    BlobFile,
                    fileName + "_" + currentDateTime + EXCEL_EXTENSION
                );
            },
            (err) => {
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(
                    err instanceof Object ? "Something went wrong" : err,
                    SnackBarStatus.danger
                );
            }
        );
    }

    removeLatLongText(text: string) {
        return text
            .replace(/"latitude":/i, "")
            .replace(/"longitude":/i, "")
            .replace("{", "")
            .replace("}", "");
    }
}
