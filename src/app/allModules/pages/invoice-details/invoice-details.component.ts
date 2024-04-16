import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
} from "@angular/core";
import {
    AuthenticationDetails,
    ChangesDetected,
    CustomerGroup,
    Itemchanges,
    SLSCustGroupData,
    UserActionHistory,
} from "app/models/master";
import { Guid } from "guid-typescript";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import {
    InvoiceDetails,
    ApproverDetails,
    InvoiceUpdation,
    InvoiceUpdation1,
    StatusTemplate,
    FilterClass,
    AttachmentDetails,
    LRWithVehicleUnloaded,
} from "app/models/invoice-details";
import {
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatSnackBar,
    MatDialogConfig,
    MatDialog,
} from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { DashboardService } from "app/services/dashboard.service";
import { ShareParameterService } from "app/services/share-parameters.service";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { fuseAnimations } from "@fuse/animations";
import { NotificationDialogComponent } from "app/notifications/notification-dialog/notification-dialog.component";
import {
    FormGroup,
    FormArray,
    FormBuilder,
    AbstractControl,
    Validators,
} from "@angular/forms";
import { BehaviorSubject, forkJoin, Observable } from "rxjs";
import { InvoiceService } from "app/services/invoice.service";
import { DatePipe } from "@angular/common";
import { ExcelService } from "app/services/excel.service";
import { saveAs } from "file-saver";
import { ModifyLayoutComponent } from "app/allModules/ModifyLayout/modify-layout/modify-layout.component";
import { ReportService } from "app/services/report.service";
import { AttachmentDialogComponent } from "app/allModules/reports/attachment-dialog/attachment-dialog.component";
import { MasterService } from "app/services/master.service";
@Component({
    selector: "app-invoice-details",
    templateUrl: "./invoice-details.component.html",
    styleUrls: ["./invoice-details.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class InvoiceDetailsComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserCode: string;
    currentUserRole: string;
    MenuItems: string[];
    isProgressBarVisibile: boolean;
    allInvoicesCount: number;
    minDate: Date;
    maxDate: Date;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    allInvoiceDetails: InvoiceDetails[] = [];
    InvoiceDetailsFormGroup: FormGroup;
    InvoiceDetailsFormArray: FormArray = this._formBuilder.array([]);
    selectedViewColumns: string[] = [];
    displayedColumns: string[] = [
        // 'SELECT',
        // 'ORGANIZATION',
        // 'DIVISION',
        // 'PLANT',
        "PLANT_NAME",
        "ODIN",
        "INV_NO",
        "INV_DATE",
        "INV_TYPE",
        "INVOICE_QUANTITY",
        // 'OUTBOUND_DELIVERY',
        // 'OUTBOUND_DELIVERY_DATE',
        "CUSTOMER",
        "CUSTOMER_NAME",
        "CUSTOMER_DESTINATION",
        // 'DISTANCE',
        // 'CUSTOMER_GROUP',
        // 'CUSTOMER_GROUP_DESC',
        // 'SECTOR_DESCRIPTION',
        "FWD_AGENT",
        "LR_NO",
        "LR_DATE",
        "VEHICLE_NO",
        "CARRIER",
        "VEHICLE_CAPACITY",
        // 'EWAYBILL_NO',
        // 'EWAYBILL_DATE',
        // 'FREIGHT_ORDER',
        // 'FREIGHT_ORDER_DATE',
        "PROPOSED_DELIVERY_DATE",
        "VEHICLE_REPORTED_DATE",
        "ACTUAL_DELIVERY_DATE",
        "TRANSIT_LEAD_TIME",
        "DRIVER_CONTACT",
        "TRACKING_LINK",
        "TOTAL_DISTANCE",
        "TOTAL_TRAVEL_TIME",
        "STATUS",
        "VIEW",
        "Action",
    ];
    selectedColumnNames: string[] = [];
    dataSource: MatTableDataSource<AbstractControl>;
    selection = new SelectionModel<InvoiceDetails>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild("fileInput") fileInput: ElementRef<HTMLElement>;
    @ViewChild("fileInput1") fileInput1: ElementRef<HTMLElement>;
    fileToUpload: File;
    fileToUploadList: File[] = [];
    SelectedInvoiceDetail: InvoiceDetails;
    InvoiceFilterFormGroup: FormGroup;
    AllStatusTemplates: StatusTemplate[] = [];
    isDateError: boolean;
    CurrentFilterClass: FilterClass = new FilterClass();
    currentCustomPage: number;
    records: number;
    isLoadMoreVisible: boolean;
    AllSalesGroups: SLSCustGroupData[] = [];
    AllCustomerGroups: CustomerGroup[] = [];
    constructor(
        private _router: Router,
        private _reportService: ReportService,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        private _invoiceService: InvoiceService,
        private _excelService: ExcelService,
        private _datePipe: DatePipe,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _masterService: MasterService
    ) {
        this.selectedViewColumns = this.displayedColumns;
        this.isProgressBarVisibile = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.SelectedInvoiceDetail = new InvoiceDetails();
        this.isDateError = false;
        this.minDate = new Date();
        this.maxDate = new Date();
        this.CurrentFilterClass =
            this._shareParameterService.GetInvoiceFilterClass();
        this.allInvoiceDetails = [];
        this.currentCustomPage = 1;
        this.records = 500;
        this.isLoadMoreVisible = false;
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = sessionStorage.getItem("authorizationData");

        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.userID;
            this.currentUserName = this.authenticationDetails.userName;
            this.currentUserCode = this.authenticationDetails.userCode;
            this.currentUserRole = this.authenticationDetails.userRole;
            this.MenuItems =
                this.authenticationDetails.menuItemNames.split(",");
            if (this.MenuItems.indexOf("InvoiceDetails") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
        this.InvoiceDetailsFormGroup = this._formBuilder.group({
            InvoiceDetails: this.InvoiceDetailsFormArray,
        });
        if (this.CurrentFilterClass) {
            this.InvoiceFilterFormGroup = this._formBuilder.group({
                Status: [
                    this.CurrentFilterClass.Status
                        ? this.CurrentFilterClass.Status
                        : ["Open"],
                    Validators.required,
                ],
                StartDate: [this.CurrentFilterClass.StartDate],
                EndDate: [this.CurrentFilterClass.EndDate],
                InvoiceNumber: [
                    this.CurrentFilterClass.InvoiceNumber
                        ? this.CurrentFilterClass.InvoiceNumber
                        : "",
                ],
                LRNumber: [
                    this.CurrentFilterClass.LRNumber
                        ? this.CurrentFilterClass.LRNumber
                        : "",
                ],
                LeadTime: [
                    this.CurrentFilterClass.LeadTime
                        ? this.CurrentFilterClass.LeadTime
                        : [],
                ],
                Delivery: [
                    this.CurrentFilterClass.Delivery
                        ? this.CurrentFilterClass.Delivery
                        : [],
                ],
            });
        } else {
            this.InvoiceFilterFormGroup = this._formBuilder.group({
                Status: [["Open"]],
                StartDate: [],
                EndDate: [],
                InvoiceNumber: [""],
                LRNumber: [""],
                LeadTime: [[]],
                Delivery: [[]],
            });
        }
        if (
            this.currentUserRole.toLowerCase() === "amararaja user" ||
            this.currentUserRole.toLowerCase().includes("coordinator")
        ) {
            this.getConfirmedInvoiceDetails();
        } else {
            this.getAllInvoiceDetails();
        }
        this.AllStatusTemplates = [
            // { key: 'All Invoices', value: 'All' },
            { key: "Pending", value: "Open" },
            { key: "Saved", value: "Saved" },
            { key: "Partially Confirmed", value: "PartiallyConfirmed" },
            { key: "Confirmed", value: "Confirmed" },
            // { key: 'Approved (AR User)', value: 'Approved' }
        ];
        this.GetAllCustomerGroups();
        this.getFilteredInvoiceDetails();
    }

    ResetControl(): void {
        this.SelectedInvoiceDetail = new InvoiceDetails();
        this.fileToUpload = null;
        this.fileToUploadList = [];
        this.ResetInvoiceDetails();
    }
    ModifyLayout(): void {
        const dialogConfig: MatDialogConfig = {
            data: {
                TableColumns: this.displayedColumns,
                selectedColumns: this.selectedViewColumns,
            },
            panelClass: "confirmation-dialog",
        };
        let layoutRef = this.dialog.open(ModifyLayoutComponent, dialogConfig);
        layoutRef.afterClosed().subscribe((x: string[]) => {
            this.selectedViewColumns = x;
        });
    }
    isColumnHide(name: string) {
        if (this.selectedViewColumns.indexOf(name) >= 0) {
            return false;
        } else {
            return true;
        }
    }
    ResetInvoiceDetails(): void {
        this.ClearFormArray(this.InvoiceDetailsFormArray);
    }
    ClearFormArray = (formArray: FormArray) => {
        while (formArray.length !== 0) {
            formArray.removeAt(0);
        }
    };
    // applyFilter(filterValue: string): void {
    //     this.dataSource.filter = filterValue.trim().toLowerCase();
    // }

    getAllInvoiceDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetAllInvoiceDetails(this.authenticationDetails.userID)
            .subscribe(
                (data) => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    // console.log("invoice_detail_view",data);
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    // this.dataSource = new MatTableDataSource(
                    //     this.allInvoiceDetails
                    // );
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.ClearFormArray(this.InvoiceDetailsFormArray);
                    this.dataSource = new MatTableDataSource(
                        this.InvoiceDetailsFormArray.controls
                    );
                    this.allInvoiceDetails.forEach((x) => {
                        x.SECTOR_DESCRIPTION = this.GetSectorDescription(
                            x.CUSTOMER_GROUP_DESC
                        );
                        this.InsertInvoiceDetailsFormGroup(x);
                    });
                    if (this.allInvoicesCount > 0) {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    GetOpenAndSavedInvoiceDetailByUser(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetOpenAndSavedInvoiceDetailByUser(this.currentUserCode)
            .subscribe(
                (data) => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    // this.dataSource = new MatTableDataSource(
                    //     this.allInvoiceDetails
                    // );
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.ClearFormArray(this.InvoiceDetailsFormArray);
                    this.dataSource = new MatTableDataSource(
                        this.InvoiceDetailsFormArray.controls
                    );
                    this.allInvoiceDetails.forEach((x) => {
                        x.SECTOR_DESCRIPTION = this.GetSectorDescription(
                            x.CUSTOMER_GROUP_DESC
                        );
                        this.InsertInvoiceDetailsFormGroup(x);
                    });
                    if (this.allInvoicesCount > 0) {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    getConfirmedInvoiceDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetConfirmedInvoiceDetails(this.authenticationDetails.userID)
            .subscribe(
                (data) => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    // console.log("allInvoiceDetails",this.allInvoiceDetails);
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    // this.dataSource = new MatTableDataSource(
                    //     this.allInvoiceDetails
                    // );
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.ClearFormArray(this.InvoiceDetailsFormArray);
                    this.allInvoiceDetails.forEach((x) => {
                        x.SECTOR_DESCRIPTION = this.GetSectorDescription(
                            x.CUSTOMER_GROUP_DESC
                        );
                        this.InsertInvoiceDetailsFormGroup(x);
                    });
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    InsertInvoiceDetailsFormGroup(asnItem: InvoiceDetails): void {
        const row = this._formBuilder.group({
            HEADER_ID: [asnItem.HEADER_ID],
            ORGANIZATION: [asnItem.ORGANIZATION],
            DIVISION: [asnItem.DIVISION],
            PLANT: [asnItem.PLANT],
            PLANT_NAME: [asnItem.PLANT_NAME],
            ODIN: [asnItem.ODIN],
            INV_NO: [asnItem.INV_NO],
            INV_DATE: [asnItem.INV_DATE],
            INV_TYPE: [asnItem.INV_TYPE],
            OUTBOUND_DELIVERY: [asnItem.OUTBOUND_DELIVERY],
            OUTBOUND_DELIVERY_DATE: [asnItem.OUTBOUND_DELIVERY_DATE],
            CUSTOMER: [asnItem.CUSTOMER],
            CUSTOMER_NAME: [asnItem.CUSTOMER_NAME],
            CUSTOMER_DESTINATION: [asnItem.CUSTOMER_DESTINATION],
            DISTANCE: [asnItem.DISTANCE],
            CUSTOMER_GROUP_CODE: [asnItem.CUSTOMER_GROUP],
            CUSTOMER_GROUP_DESC: [asnItem.CUSTOMER_GROUP_DESC],
            SECTOR_DESCRIPTION: [asnItem.SECTOR_DESCRIPTION],
            FWD_AGENT: [asnItem.FWD_AGENT],
            LR_NO: [asnItem.LR_NO],
            LR_DATE: [asnItem.LR_DATE],
            VEHICLE_NO: [asnItem.VEHICLE_NO],
            VEHICLE_CAPACITY: [asnItem.VEHICLE_CAPACITY],
            CARRIER: [asnItem.CARRIER],
            EWAYBILL_NO: [asnItem.EWAYBILL_NO],
            EWAYBILL_DATE: [asnItem.EWAYBILL_DATE],
            FREIGHT_ORDER: [asnItem.FREIGHT_ORDER],
            FREIGHT_ORDER_DATE: [asnItem.FREIGHT_ORDER_DATE],
            PROPOSED_DELIVERY_DATE: [asnItem.PROPOSED_DELIVERY_DATE],
            ACTUAL_DELIVERY_DATE: [asnItem.ACTUAL_DELIVERY_DATE],
            TRANSIT_LEAD_TIME: [asnItem.TRANSIT_LEAD_TIME],
            STATUS: [asnItem.STATUS],
            VEHICLE_REPORTED_DATE: [asnItem.VEHICLE_REPORTED_DATE],
            ATTACHMENT_ID: [asnItem.ATTACHMENT_ID],
            ATTACHMENT_NAME: [asnItem.ATTACHMENT_NAME],
            INVOICE_QUANTITY: [asnItem.INVOICE_QUANTITY],
            DRIVER_CONTACT: [asnItem.DRIVER_CONTACT],
            TRACKING_LINK: [asnItem.TRACKING_LINK],
            TOTAL_DISTANCE: [asnItem.TOTAL_DISTANCE],
            TOTAL_TRAVEL_TIME: [asnItem.TOTAL_TRAVEL_TIME],
        });
        row.disable();
        // let minDate = new Date();
        // if (asnItem.LR_DATE) {
        //     minDate = asnItem.LR_DATE as Date;
        // } else if (asnItem.INV_DATE) {
        //     minDate = asnItem.INV_DATE as Date;
        // }
        // row.get('VEHICLE_REPORTED_DATE').setValidators(Validators.min(minDate));
        if (row.get("STATUS").value.toLocaleLowerCase() != "confirmed") {
            row.get("VEHICLE_REPORTED_DATE").enable();
        }
        this.InvoiceDetailsFormArray.push(row);
        this.dataSource = new MatTableDataSource(
            this.InvoiceDetailsFormArray.controls
        );
        // return row;
    }

    invoiceRowClick(index: number): void {
        const row1 = this.GetSelectedInvoiceDeatils(index);
        this._shareParameterService.SetInvoiceDetail(row1);
        this._router.navigate(["/pages/invItem"]);
    }

    GetSelectedInvoiceDeatils(index: number): InvoiceDetails {
        const ivoiceDetailsFormArray = this.InvoiceDetailsFormGroup.get(
            "InvoiceDetails"
        ) as FormArray;
        // const row1 = new InvoiceDetails();
        const invNo =
            ivoiceDetailsFormArray.controls[index].get("INV_NO").value;
        const row1 = this.allInvoiceDetails.filter(
            (x) => x.INV_NO === invNo
        )[0];
        if (row1) {
            if (
                ivoiceDetailsFormArray.controls[index].get(
                    "VEHICLE_REPORTED_DATE"
                ).valid
            ) {
                row1.VEHICLE_REPORTED_DATE = ivoiceDetailsFormArray.controls[
                    index
                ].get("VEHICLE_REPORTED_DATE").value;
            }
            return row1;
        }

        return new InvoiceDetails();
    }

    SaveAndUploadInvoiceItem(index: number): void {
        this.SelectedInvoiceDetail = this.GetSelectedInvoiceDeatils(index);
        if (
            this.SelectedInvoiceDetail.STATUS &&
            this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== "approved"
        ) {
            if (this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE) {
                const el: HTMLElement = this.fileInput.nativeElement;
                el.click();
                // const event = new MouseEvent('click', { bubbles: true });
                // this.renderer.invokeElementMethod(
                //   this.fileInput.nativeElement, 'dispatchEvent', [event]);
            } else {
                this.notificationSnackBarComponent.openSnackBar(
                    "Please fill out valid Vehicle unloaded date",
                    SnackBarStatus.danger
                );
            }
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Invoice has already been approved",
                SnackBarStatus.danger
            );
        }
    }

    ConfirmInvoiceItemWithoutAttachment(index: number) {
        this.SelectedInvoiceDetail = this.GetSelectedInvoiceDeatils(index);
        if (this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE) {
            this.SelectedInvoiceDetail = this.GetSelectedInvoiceDeatils(index);
            const Actiontype = "Confirm";
            const Catagory = "Invoice";
            this.OpenConfirmationDialog(Actiontype, Catagory, true);
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Please fill out valid Vehicle unloaded date",
                SnackBarStatus.danger
            );
        }
    }

    ReUploadInvoiceAttachment(index: number) {
        this.SelectedInvoiceDetail = this.GetSelectedInvoiceDeatils(index);
        const el: HTMLElement = this.fileInput1.nativeElement;
        el.click();
    }

    handleFileInput(evt): void {
        if (evt.target.files && evt.target.files.length > 0) {
            if (
                Math.round(Number(evt.target.files[0].size) / (1024 * 1024)) <=
                5
            ) {
                this.fileToUpload = evt.target.files[0];
                this.fileToUploadList = [];
                this.fileToUploadList.push(this.fileToUpload);
                const Actiontype = "Confirm";
                const Catagory = "Invoice";
                this.OpenConfirmationDialog(Actiontype, Catagory);
            } else {
                this.notificationSnackBarComponent.openSnackBar(
                    "Please upload file size below 5 MB",
                    SnackBarStatus.danger
                );
            }
        }
    }

    handleFileInput1(evt): void {
        const VehReportedDate = this._datePipe.transform(
            this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE,
            "yyyy-MM-dd HH:mm:ss"
        );
        if (
            VehReportedDate != null &&
            VehReportedDate != "" &&
            !VehReportedDate.toString().includes("1970")
        ) {
            if (evt.target.files && evt.target.files.length > 0) {
                if (
                    Math.round(
                        Number(evt.target.files[0].size) / (1024 * 1024)
                    ) <= 5
                ) {
                    this.fileToUpload = evt.target.files[0];
                    this.fileToUploadList = [];
                    this.fileToUploadList.push(this.fileToUpload);
                    const Changes = new ChangesDetected();
                    Changes.Status = this.SelectedInvoiceDetail.STATUS
                        ? "Current Status is " +
                          this.SelectedInvoiceDetail.STATUS
                        : "";
                    Changes.DocumentReUpload = this.fileToUpload.name;
                    const ActionLog = new UserActionHistory();
                    ActionLog.Action = "Web";
                    ActionLog.ChangesDetected = JSON.stringify(Changes);
                    ActionLog.DateTime = new Date();
                    ActionLog.IpAddress = this.authenticationDetails.ipAddress
                        ? this.authenticationDetails.ipAddress
                        : "";
                    ActionLog.Location = this.authenticationDetails.geoLocation
                        ? this.authenticationDetails.geoLocation
                        : "";
                    ActionLog.TransID = this.SelectedInvoiceDetail.HEADER_ID;
                    ActionLog.UserName = this.authenticationDetails.userName;
                    this.isProgressBarVisibile = true;

                    this._invoiceService
                        .AddInvoiceAttachment(
                            this.SelectedInvoiceDetail.HEADER_ID,
                            this.currentUserID.toString(),
                            this.fileToUploadList
                        )
                        .subscribe({
                            next: (res) => {
                                this._invoiceService
                                    .CreateUserActionHistory(ActionLog)
                                    .subscribe({
                                        next: (res) => {
                                            this.isProgressBarVisibile = false;
                                            this.SearchInvoices();
                                            this.notificationSnackBarComponent.openSnackBar(
                                                `Document Uploaded successfully`,
                                                SnackBarStatus.success
                                            );
                                        },
                                        error: (err) => {
                                            this.isProgressBarVisibile = false;
                                            this.notificationSnackBarComponent.openSnackBar(
                                                err instanceof Object
                                                    ? "Something went wrong"
                                                    : err,
                                                SnackBarStatus.danger
                                            );
                                        },
                                    });
                            },
                            error: (err) => {
                                this.isProgressBarVisibile = false;
                                this.notificationSnackBarComponent.openSnackBar(
                                    err instanceof Object
                                        ? "Something went wrong"
                                        : err,
                                    SnackBarStatus.danger
                                );
                            },
                        });
                } else {
                    this.notificationSnackBarComponent.openSnackBar(
                        "Please upload file size below 5 MB",
                        SnackBarStatus.danger
                    );
                }
            }
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Please fill valid vehicle unloaded date.",
                SnackBarStatus.danger
            );
        }
    }

    ApproveSelectedInvoices(): void {
        const Actiontype = "Approve";
        const Catagory = "Selected Invoice(s)";
        this.OpenConfirmationDialog(Actiontype, Catagory);
    }

    OpenConfirmationDialog(
        Actiontype: string,
        Catagory: string,
        IsWithoutDoc = false
    ): void {
        const dialogConfig: MatDialogConfig = {
            data: {
                Actiontype: Actiontype,
                Catagory: Catagory,
            },
            panelClass: "confirmation-dialog",
        };
        const dialogRef = this.dialog.open(
            NotificationDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.ConfirmInvoiceItems(Actiontype, IsWithoutDoc);
            }
        });
    }

    ConfirmInvoiceItems(Actiontype: string, IsWithoutDoc = false) {
        this.isProgressBarVisibile = true;
        const invoiceUpdation = new InvoiceUpdation1();
        const VehReportedDate = this._datePipe.transform(
            this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE,
            "yyyy-MM-dd HH:mm:ss"
        );
        invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
        invoiceUpdation.HEADER_ID = this.SelectedInvoiceDetail.HEADER_ID;
        const Changes = new ChangesDetected();
        Changes.Status =
            this.SelectedInvoiceDetail.STATUS + " to " + Actiontype;
        Changes.UnloadedDate = invoiceUpdation.VEHICLE_REPORTED_DATE;
        if (!IsWithoutDoc) {
            Changes.DocumentUpload = this.fileToUpload.name;
        }
        const ActionLog = new UserActionHistory();
        ActionLog.Action = "Web";
        ActionLog.ChangesDetected = JSON.stringify(Changes);
        ActionLog.DateTime = new Date();
        ActionLog.IpAddress = this.authenticationDetails.ipAddress
            ? this.authenticationDetails.ipAddress
            : "";
        ActionLog.Location = this.authenticationDetails.geoLocation
            ? this.authenticationDetails.geoLocation
            : "";
        ActionLog.TransID = invoiceUpdation.HEADER_ID;
        ActionLog.UserName = this.authenticationDetails.userName;
        if (
            invoiceUpdation.VEHICLE_REPORTED_DATE != null &&
            !invoiceUpdation.VEHICLE_REPORTED_DATE.includes("1970")
        ) {
            if (IsWithoutDoc) {
                forkJoin(
                    this._invoiceService.ConfirmInvoiceItems(invoiceUpdation),
                    this._invoiceService.CreateUserActionHistory(ActionLog)
                ).subscribe(
                    () => {
                        this.isProgressBarVisibile = false;
                        this.ResetControl();
                        this.SearchInvoices();
                        this.notificationSnackBarComponent.openSnackBar(
                            `Invoice confirmed successfully`,
                            SnackBarStatus.success
                        );
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
            } else {
                var payload = new LRWithVehicleUnloaded();
                payload.LRNumber = this.SelectedInvoiceDetail.LR_NO;
                payload.VehicleUnloadedDate = VehReportedDate;
                payload.Customer = this.SelectedInvoiceDetail.CUSTOMER;
                payload.LRDate =
                    typeof this.SelectedInvoiceDetail.LR_DATE == "string"
                        ? new Date(this.SelectedInvoiceDetail.LR_DATE)
                        : this.SelectedInvoiceDetail.LR_DATE;
                if (
                    payload.VehicleUnloadedDate != null &&
                    !payload.VehicleUnloadedDate.includes("1970")
                ) {
                    this._invoiceService
                        .AddInvoiceAttachment(
                            this.SelectedInvoiceDetail.HEADER_ID,
                            this.currentUserID.toString(),
                            this.fileToUploadList
                        )
                        .subscribe({
                            next: (res) => {
                                forkJoin(
                                    this._invoiceService.ConfirmInvoiceItems(
                                        invoiceUpdation
                                    ),
                                    this._invoiceService.CreateUserActionHistory(
                                        ActionLog
                                    ),
                                    this._invoiceService.UpdateVehicleUnloadedDateByLR(
                                        payload
                                    )
                                ).subscribe(
                                    () => {
                                        this.isProgressBarVisibile = false;
                                        this.ResetControl();
                                        this.SearchInvoices();
                                        this.notificationSnackBarComponent.openSnackBar(
                                            `Invoice confirmed successfully`,
                                            SnackBarStatus.success
                                        );
                                    },
                                    (err) => {
                                        this.isProgressBarVisibile = false;
                                        this.notificationSnackBarComponent.openSnackBar(
                                            err instanceof Object
                                                ? "Something went wrong"
                                                : err,
                                            SnackBarStatus.danger
                                        );
                                    }
                                );
                            },
                            error: (err) => {
                                this.isProgressBarVisibile = false;
                                this.notificationSnackBarComponent.openSnackBar(
                                    err instanceof Object
                                        ? "Something went wrong"
                                        : err,
                                    SnackBarStatus.danger
                                );
                            },
                        });
                } else {
                    this.notificationSnackBarComponent.openSnackBar(
                        "Please fill valid vehicle unloaded date.",
                        SnackBarStatus.danger
                    );
                }
            }
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Please fill valid vehicle unloaded date.",
                SnackBarStatus.danger
            );
            this.isProgressBarVisibile = false;
        }
    }

    // ConfirmInvoiceItems(Actiontype: string): void {
    //     this.isProgressBarVisibile = true;
    //     const invoiceUpdation = new InvoiceUpdation1();
    //     const VehReportedDate = this._datePipe.transform(this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE, 'yyyy-MM-dd HH:mm:ss');
    //     invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
    //     invoiceUpdation.HEADER_ID = this.SelectedInvoiceDetail.HEADER_ID;
    //     this._invoiceService.ConfirmInvoiceItems(invoiceUpdation).subscribe(
    //         data => {
    //             const Ststs = 'confirmed';
    //             if (Actiontype === 'Confirm' && this.fileToUploadList && this.fileToUploadList.length) {
    //                 this._invoiceService.AddInvoiceAttachment(this.SelectedInvoiceDetail.HEADER_ID,
    //                     this.currentUserID.toString(), this.fileToUploadList).subscribe(
    //                         (dat) => {
    //                             this.isProgressBarVisibile = false;
    //                             this.notificationSnackBarComponent.openSnackBar(`Invoice ${Ststs} successfully`, SnackBarStatus.success);
    //                             this.ResetControl();
    //                             this.GetOpenAndSavedInvoiceDetailByUser();

    //                             const Changes = new ChangesDetected();
    //                             Changes.Status = Actiontype + " to " + Ststs;
    //                             Changes.UnloadedDate = invoiceUpdation.VEHICLE_REPORTED_DATE;
    //                             const ActionLog = new UserActionHistory();
    //                             ActionLog.Action = "Web";
    //                             ActionLog.ChangesDetected = JSON.stringify(Changes);
    //                             ActionLog.DateTime = new Date();
    //                             ActionLog.IpAddress = this.authenticationDetails.ipAddress ? this.authenticationDetails.ipAddress : "";
    //                             ActionLog.Location = this.authenticationDetails.geoLocation ? this.authenticationDetails.geoLocation : "";
    //                             ActionLog.TransID = invoiceUpdation.HEADER_ID
    //                             ActionLog.UserName = this.authenticationDetails.userName;
    //                             this._invoiceService.CreateUserActionHistory(ActionLog).subscribe((data) => {

    //                             })
    //                         },
    //                         (err) => {
    //                             console.error(err);
    //                             this.isProgressBarVisibile = false;
    //                             this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    //                             this.GetOpenAndSavedInvoiceDetailByUser();
    //                         }
    //                     );
    //             }
    //             else {
    //                 this.isProgressBarVisibile = false;
    //                 this.notificationSnackBarComponent.openSnackBar
    //                     (`Invoice ${Ststs} successfully`, SnackBarStatus.success);
    //                 this.ResetControl();
    //                 this.GetOpenAndSavedInvoiceDetailByUser();

    //                 const Changes = new ChangesDetected();
    //                 Changes.Status = Actiontype + " to " + Ststs;
    //                 Changes.UnloadedDate = invoiceUpdation.VEHICLE_REPORTED_DATE;

    //                 const ActionLog = new UserActionHistory();
    //                 ActionLog.Action = "Web";
    //                 ActionLog.ChangesDetected = JSON.stringify(Changes);
    //                 ActionLog.DateTime = new Date();
    //                 ActionLog.IpAddress = this.authenticationDetails.ipAddress ? this.authenticationDetails.ipAddress : "";
    //                 ActionLog.Location = this.authenticationDetails.geoLocation ? this.authenticationDetails.geoLocation : "";
    //                 ActionLog.TransID = invoiceUpdation.HEADER_ID
    //                 ActionLog.UserName = this.authenticationDetails.userName;
    //                 this._invoiceService.CreateUserActionHistory(ActionLog).subscribe((data) => {

    //                 })
    //             }

    //         },
    //         err => {
    //             this.isProgressBarVisibile = false;
    //             this.notificationSnackBarComponent.openSnackBar(
    //                 err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger
    //             );
    //         }
    //     );
    // }

    ApproveInvoices(): void {
        const approverDetails = new ApproverDetails();
        approverDetails.ApprovedBy = this.currentUserID.toString();
        approverDetails.HEADERIDs = this.selection.selected.map(
            (a) => a.HEADER_ID
        );
        this.isProgressBarVisibile = true;
        this._dashboardService
            .ApproveSelectedInvoices(approverDetails)
            .subscribe(
                (data) => {
                    this.notificationSnackBarComponent.openSnackBar(
                        `Selected Invoice(s) approved successfully`,
                        SnackBarStatus.success
                    );
                    this.selection = new SelectionModel<InvoiceDetails>(
                        true,
                        []
                    );
                    this.getConfirmedInvoiceDetails();
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }
    SearchInvoices(): void {
        this.currentCustomPage = 1;
        this.allInvoiceDetails = [];
        this.getFilteredInvoiceDetails();
    }
    LoadMoreData(): void {
        this.currentCustomPage = this.currentCustomPage + 1;
        this.getFilteredInvoiceDetails();
    }
    getFilteredInvoiceDetails(): void {
        if (this.InvoiceFilterFormGroup.valid) {
            if (!this.isDateError) {
                this.isProgressBarVisibile = true;
                const Status = this.InvoiceFilterFormGroup.get("Status")
                    .value as any[];
                const InvoiceNumber =
                    this.InvoiceFilterFormGroup.get("InvoiceNumber").value;
                const LRNumber =
                    this.InvoiceFilterFormGroup.get("LRNumber").value;
                let StartDate = null;
                const staDate =
                    this.InvoiceFilterFormGroup.get("StartDate").value;
                if (staDate) {
                    StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
                }
                let EndDate = null;
                const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
                if (enDate) {
                    EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
                }
                if (!this.CurrentFilterClass) {
                    this.CurrentFilterClass = new FilterClass();
                }
                this.CurrentFilterClass.Status =
                    Status.length > 0 ? Status : [];
                this.CurrentFilterClass.StartDate = StartDate;
                this.CurrentFilterClass.EndDate = EndDate;
                this.CurrentFilterClass.LRNumber = LRNumber;
                this.CurrentFilterClass.InvoiceNumber = InvoiceNumber;
                this.CurrentFilterClass.UserCode = this.currentUserCode;
                this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
                this.CurrentFilterClass.Records = this.records;
                this.CurrentFilterClass.LeadTime =
                    this.InvoiceFilterFormGroup.get("LeadTime").value;
                this.CurrentFilterClass.Delivery =
                    this.InvoiceFilterFormGroup.get("Delivery").value;
                this._shareParameterService.SetInvoiceFilterClass(
                    this.CurrentFilterClass
                );
                this._dashboardService
                    .FilterInvoiceDetailByUser(this.CurrentFilterClass)
                    .subscribe(
                        (data) => {
                            // console.log("invoice_detail_view",data);
                            // this.allInvoiceDetails = data as InvoiceDetails[];
                            const data1 = data as InvoiceDetails[];
                            if (data1) {
                                if (data.length < this.records) {
                                    this.isLoadMoreVisible = false;
                                } else {
                                    this.isLoadMoreVisible = true;
                                }
                                data1.forEach((x) => {
                                    this.allInvoiceDetails.push(x);
                                });
                            }
                            this.allInvoicesCount =
                                this.allInvoiceDetails.length;
                            // this.dataSource = new MatTableDataSource(
                            //     this.allInvoiceDetails
                            // );
                            // this.dataSource.paginator = this.paginator;
                            // this.dataSource.sort = this.sort;
                            this.ClearFormArray(this.InvoiceDetailsFormArray);
                            this.dataSource = new MatTableDataSource(
                                this.InvoiceDetailsFormArray.controls
                            );
                            this.allInvoiceDetails.forEach((x) => {
                                x.SECTOR_DESCRIPTION =
                                    this.GetSectorDescription(
                                        x.CUSTOMER_GROUP_DESC
                                    );
                                this.InsertInvoiceDetailsFormGroup(x);
                            });
                            if (this.allInvoicesCount > 0) {
                                this.dataSource.paginator = this.paginator;
                                this.dataSource.sort = this.sort;
                            }
                            this.isProgressBarVisibile = false;
                        },
                        (err) => {
                            this.isProgressBarVisibile = false;
                            this.notificationSnackBarComponent.openSnackBar(
                                err instanceof Object
                                    ? "Something went wrong"
                                    : err,
                                SnackBarStatus.danger
                            );
                        }
                    );
            }
        } else {
            Object.keys(this.InvoiceFilterFormGroup.controls).forEach((key) => {
                this.InvoiceFilterFormGroup.get(key).markAsTouched();
                this.InvoiceFilterFormGroup.get(key).markAsDirty();
            });
        }
    }

    DateSelected(): void {
        const FROMDATEVAL = this.InvoiceFilterFormGroup.get("StartDate")
            .value as Date;
        const TODATEVAL = this.InvoiceFilterFormGroup.get("EndDate")
            .value as Date;
        if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
            this.isDateError = true;
        } else {
            this.isDateError = false;
        }
    }
    onKeydown(event): boolean {
        // console.log(event.key);
        if (event.key === "Backspace" || event.key === "Delete") {
            return true;
        } else {
            return false;
        }
    }

    exportAsXLSX(): void {
        if (this.InvoiceFilterFormGroup.valid) {
            if (!this.isDateError) {
                this.isProgressBarVisibile = true;
                const Status = this.InvoiceFilterFormGroup.get("Status")
                    .value as any[];
                const InvoiceNumber =
                    this.InvoiceFilterFormGroup.get("InvoiceNumber").value;
                const LRNumber =
                    this.InvoiceFilterFormGroup.get("LRNumber").value;
                let StartDate = null;
                const staDate =
                    this.InvoiceFilterFormGroup.get("StartDate").value;
                if (staDate) {
                    StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
                }
                let EndDate = null;
                const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
                if (enDate) {
                    EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
                }
                if (!this.CurrentFilterClass) {
                    this.CurrentFilterClass = new FilterClass();
                }
                this.CurrentFilterClass.Status =
                    Status.length > 0 ? Status : [];
                this.CurrentFilterClass.StartDate = StartDate;
                this.CurrentFilterClass.EndDate = EndDate;
                this.CurrentFilterClass.LRNumber = LRNumber;
                this.CurrentFilterClass.InvoiceNumber = InvoiceNumber;
                this.CurrentFilterClass.UserCode = this.currentUserCode;
                this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
                this.CurrentFilterClass.Records = this.records;
                this.CurrentFilterClass.LeadTime =
                    this.InvoiceFilterFormGroup.get("LeadTime").value;
                this.CurrentFilterClass.Delivery =
                    this.InvoiceFilterFormGroup.get("Delivery").value;
                this._shareParameterService.SetInvoiceFilterClass(
                    this.CurrentFilterClass
                );
                this._dashboardService
                    .DownloadInvoiceDetailByUser(this.CurrentFilterClass)
                    .subscribe(
                        (data) => {
                            this.isProgressBarVisibile = false;
                            const BlobFile = data as Blob;
                            const currentDateTime = this._datePipe.transform(
                                new Date(),
                                "ddMMyyyyHHmmss"
                            );
                            const fileName = "Invoice details";
                            const EXCEL_EXTENSION = ".xlsx";
                            saveAs(
                                BlobFile,
                                fileName +
                                    "_" +
                                    currentDateTime +
                                    EXCEL_EXTENSION
                            );
                        },
                        (err) => {
                            this.isProgressBarVisibile = false;
                            this.notificationSnackBarComponent.openSnackBar(
                                err instanceof Object
                                    ? "Something went wrong"
                                    : err,
                                SnackBarStatus.danger
                            );
                        }
                    );
            }
        } else {
            Object.keys(this.InvoiceFilterFormGroup.controls).forEach((key) => {
                this.InvoiceFilterFormGroup.get(key).markAsTouched();
                this.InvoiceFilterFormGroup.get(key).markAsDirty();
            });
        }
        // const currentPageIndex = this.dataSource.paginator.pageIndex;
        // const PageSize = this.dataSource.paginator.pageSize;
        // const startIndex = currentPageIndex * PageSize;
        // const endIndex = startIndex + PageSize;
        // const itemsShowed = this.allInvoiceDetails.slice(startIndex, endIndex);
        // const itemsShowedd = [];
        // itemsShowed.forEach(x => {
        //     const item = {
        //         'Organization': x.ORGANIZATION,
        //         'Division': x.DIVISION,
        //         'Plant': x.PLANT,
        //         'Invoice No': x.ODIN,
        //         'Reference No': x.INV_NO,
        //         'Invoice Date': x.INV_DATE ? this._datePipe.transform(x.INV_DATE, 'dd-MM-yyyy') : '',
        //         'Invoice Type': x.INV_TYPE,
        //         'Outbound delivery': x.OUTBOUND_DELIVERY,
        //         'Outbound delivery date': x.OUTBOUND_DELIVERY_DATE ? this._datePipe.transform(x.OUTBOUND_DELIVERY_DATE, 'dd-MM-yyyy') : '',
        //         'LR Number': x.LR_NO,
        //         'LR date': x.LR_DATE ? this._datePipe.transform(x.LR_DATE, 'dd-MM-yyyy') : '',
        //         'Vehicle No': x.VEHICLE_NO,
        //         'Carrier': x.CARRIER,
        //         'Vehicle Capacity': x.VEHICLE_CAPACITY,
        //         'E-Way bill No': x.EWAYBILL_NO,
        //         'E-Way bill date': x.EWAYBILL_DATE ? this._datePipe.transform(x.EWAYBILL_DATE, 'dd-MM-yyyy') : '',
        //         'Freight order': x.FREIGHT_ORDER,
        //         'Freight order date': x.FREIGHT_ORDER_DATE ? this._datePipe.transform(x.FREIGHT_ORDER_DATE, 'dd-MM-yyyy') : '',
        //         'Proposed delivery date': x.PROPOSED_DELIVERY_DATE ? this._datePipe.transform(x.PROPOSED_DELIVERY_DATE, 'dd-MM-yyyy') : '',
        //         'Actual delivery date': x.ACTUAL_DELIVERY_DATE ? this._datePipe.transform(x.ACTUAL_DELIVERY_DATE, 'dd-MM-yyyy') : '',
        //         'Lead time': x.TRANSIT_LEAD_TIME,
        //         'Status': x.STATUS,
        //         'Vehicle reported date': x.VEHICLE_REPORTED_DATE ? this._datePipe.transform(x.ACTUAL_DELIVERY_DATE, 'dd-MM-yyyy') : '',
        //     };
        //     itemsShowedd.push(item);
        // });
        // this._excelService.exportAsExcelFile(itemsShowedd, 'invoices');
    }

    DowloandPODDocument(
        HeaderID: number,
        AttachmentID: number,
        fileName: string
    ): void {
        this.isProgressBarVisibile = true;
        this._reportService
            .DowloandPODDocument(HeaderID, AttachmentID)
            .subscribe(
                (data) => {
                    this.isProgressBarVisibile = false;
                    if (data) {
                        // const BlobFile = data as Blob;
                        // saveAs(BlobFile, fileName);
                        let fileType = "image/jpg";
                        fileType = fileName.toLowerCase().includes(".jpg")
                            ? "image/jpg"
                            : fileName.toLowerCase().includes(".jpeg")
                            ? "image/jpeg"
                            : fileName.toLowerCase().includes(".png")
                            ? "image/png"
                            : fileName.toLowerCase().includes(".gif")
                            ? "image/gif"
                            : fileName.toLowerCase().includes(".pdf")
                            ? "application/pdf"
                            : "";
                        // console.log(fileName)
                        const blob = new Blob([data], { type: fileType });
                        this.OpenAttachmentDialog(fileName, blob);
                    }
                },
                (error) => {
                    console.error(error);
                    this.isProgressBarVisibile = false;
                }
            );
    }

    OpenAttachmentDialog(FileName: string, blob: Blob): void {
        const attachmentDetails: AttachmentDetails = {
            FileName: FileName,
            blob: blob,
        };
        const dialogConfig: MatDialogConfig = {
            data: attachmentDetails,
            panelClass: "attachment-dialog",
        };
        const dialogRef = this.dialog.open(
            AttachmentDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
            }
        });
    }

    GetAllSLSGroups(): void {
        this.isProgressBarVisibile = true;
        this._masterService.GetAllSalesGroups().subscribe(
            (data) => {
                if (data) {
                    this.AllSalesGroups = data as SLSCustGroupData[];
                    // console.log("salesGroups", this.AllSalesGroups);
                    this.isProgressBarVisibile = false;
                }
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetSectorDescription(cg: string): string {
        var customerGroup = this.AllCustomerGroups.find(
            (x) => x.CustomerGroupCode == cg
        );
        if (customerGroup != undefined) {
            return customerGroup.Sector;
        } else {
            return "";
        }
    }

    GetAllCustomerGroups(): void {
        // this.isProgressBarVisibile = true;
        this._masterService.GetAllCustomerGroups().subscribe(
            (data) => {
                if (data) {
                    this.AllCustomerGroups = data as CustomerGroup[];
                }
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    trackProduct(link: string): void {
        if (link) {
            window.open(link);
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "No Tracking link maintained for this invoice.",
                SnackBarStatus.info
            );
        }
    }
}
