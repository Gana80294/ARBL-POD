import { DatePipe } from "@angular/common";
import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    MatDialog,
    MatDialogConfig,
    MatPaginator,
    MatSnackBar,
    MatSort,
    MatTableDataSource,
} from "@angular/material";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { Router } from "@angular/router";
import { AttachmentDialogComponent } from "app/allModules/reports/attachment-dialog/attachment-dialog.component";
import {
    AttachmentDetails,
    ReversePOD,
    ReversePODFilter,
    ReversePodUpdation,
} from "app/models/invoice-details";
import { AuthenticationDetails } from "app/models/master";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/snackbar-status-enum";
import { DashboardService } from "app/services/dashboard.service";
import { MasterService } from "app/services/master.service";
import { ReversePodService } from "app/services/reverse-pod.service";
import { ChartType } from "chart.js";
import { Guid } from "guid-typescript";
import { saveAs } from "file-saver";
import { ShareParameterService } from "app/services/share-parameters.service";

@Component({
    selector: "app-reverse-logistics",
    templateUrl: "./reverse-logistics.component.html",
    styleUrls: ["./reverse-logistics.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ReverseLogisticsComponent implements OnInit {
    InvoiceFilterFormGroup: FormGroup;

    RpodDetailsFormGroup: FormGroup;
    RpodDetailsFormArray: FormArray = this._formBuilder.array([]);
    //status:any;
    //@ViewChild('Quantity')Quantity:ElementRef;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    public doughnutChartType: ChartType = "doughnut";
    public doughnutChartLabels: any[] = [
        "Pending",
        "Intransit",
        "Partially Confirmed",
        "Confirmed",
    ];
    remarkOptions: any[] = ["Partially Confirmed", "Confirmed"];
    public doughnutChartData: any[] = [0, 0, 0, 0];

    public colors: any[] = [
        { backgroundColor: ["yellow", "#fb7800", "#4452c6", "#52de97"] },
    ];

    public doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: "right",
            labels: {
                fontSize: 10,
                render: "percentage",
                padding: 20,
                usePointStyle: true,
            },
        },
        cutoutPercentage: 60,
        elements: {
            arc: {
                borderWidth: 0,
            },
        },
        plugins: {
            labels: {
                render: function (args) {
                    return args.value + "\n(" + args.percentage + "%" + ")";
                },
                fontColor: "#000",
                position: "default",
            },
        },
    };
    FilteredRpodDetails = [];
    displayedColumns = [
        "DC_Number",
        "SLA_DATE",
        "DC_Date",
        "Claim_Type",
        "Customer_Name",
        "Plant_Name",
        // "Material_Code",
        // "Quantity",
        // "Customer_Delivery_Quantity",
        // "Customer_Pending_Quantity",
        // "Handovered_Status",
        "LR_Number",
        "LR_Date",
        "CustomerLR",
        // "DC_Received_Quantity",
        // "DC_Pending_Quantity",
        "DC_Received_Date",
        "DC_Acknowledgement_Date",
        "Status",
        "DCLR",
        "PENDING_DAYS",
        // "Remarks",
    ];
    dataSource = new MatTableDataSource<ReversePOD>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild("reversePodFileInput") fileInput: ElementRef<HTMLElement>;
    @ViewChild("reUploadLr") fileInput1: ElementRef<HTMLElement>;

    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserRole: string;
    MenuItems: string[];

    fileToUploadList: File[] = [];
    selectedIndex: number;

    isProgressBarVisibile: boolean = false;
    isApprover: boolean = false;

    pageSize: number = 5;
    pageIndex: number = 0;
    currentCustomPage: number;
    records: number;
    isLoadMoreVisible: boolean;

    statusList = ["Open", "In Transit", "Partially Confirmed", "Confirmed"];

    constructor(
        private _formBuilder: FormBuilder,
        private _dashboard: DashboardService,
        private _router: Router,
        public snackBar: MatSnackBar,
        public _reversePod: ReversePodService,
        private _datePipe: DatePipe,
        private dialog: MatDialog,
        private _shareParameterService: ShareParameterService,
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        var currDate = new Date();
        currDate.setMonth(currDate.getMonth() - 2);
        let startDate: Date = new Date(currDate.toISOString().slice(0, 10));
        this.InvoiceFilterFormGroup = this._formBuilder.group({
            Status: [[]],
            StartDate: [startDate],
            EndDate: [new Date()],
            PlantList: [],
            CustomerName: [null],
            UserCode: [null],
            PlantGroupList: [],
        });

        this.currentCustomPage = 1;
        this.records = 250;
        this.isLoadMoreVisible = false;
    }

    ngOnInit() {
        const retrievedObject = sessionStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.userID;
            this.currentUserRole = this.authenticationDetails.userRole;
            this.MenuItems =
                this.authenticationDetails.menuItemNames.split(",");
            if (this.authenticationDetails.userRole == "Customer") {
                this.getAllReversePODData();
            } else if (
                this.authenticationDetails.userRole == "Amararaja User"
            ) {
                this.getIsApprover();
                this.filterAllReversePODs();
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
    }

    LoadMoreData(): void {
        this.currentCustomPage = this.currentCustomPage + 1;
        if (this.authenticationDetails.userRole == "Customer") {
            this.getAllReversePODData();
        } else if (this.authenticationDetails.userRole == "Amararaja User") {
            this.getIsApprover();
            this.filterAllReversePODs();
        }
    }

    getIsApprover() {
        this._reversePod
            .GetIsApprover(this.authenticationDetails.userID)
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.isApprover = res.IsApprover;
                    }
                },
                error: (err) => {},
            });
    }

    filterAllReversePODs(): void {
        this.isProgressBarVisibile = true;
        let filterPayload = new ReversePODFilter();

        filterPayload.StartDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("StartDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.EndDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("EndDate").value,
            "yyyy-MM-dd"
        );

        filterPayload.PlantList =
            this.InvoiceFilterFormGroup.get("PlantList").value &&
            this.InvoiceFilterFormGroup.get("PlantList").value.length > 0
                ? this.InvoiceFilterFormGroup.get("PlantList").value
                : this.authenticationDetails.plant ? this.authenticationDetails.plant.split(",") : [];

        filterPayload.UserCode =
            this.InvoiceFilterFormGroup.get("UserCode").value;
        filterPayload.CustomerName =
            this.InvoiceFilterFormGroup.get("CustomerName").value;

        if (this.authenticationDetails.userRole == "Customer") {
            filterPayload.UserCode = this.authenticationDetails.userCode;
        }
        filterPayload.CurrentPage = this.currentCustomPage;
        filterPayload.Records = this.records;
        filterPayload.Status = this.statusList;

        this._reversePod.FilterAllReversePODs(filterPayload).subscribe({
            next: (res) => {
                if (res.length < this.records) {
                    this.isLoadMoreVisible = false;
                } else {
                    this.isLoadMoreVisible = true;
                }
                res = this.ValueChangeEvents(res);
                this.FilteredRpodDetails = res;
                this.isProgressBarVisibile = false;
                this.dataSource = new MatTableDataSource(res);
                this.dataSource.paginator = this.paginator;
                this.updateChartValue();
            },
            error: (err) => {
                this.isProgressBarVisibile = false;
            },
        });
    }

    filterAllOpenReversePODs(isCustomer: boolean = false) {
        this.isProgressBarVisibile = true;
        let filterPayload = new ReversePODFilter();

        filterPayload.StartDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("StartDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.EndDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("EndDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.PlantList =
            this.InvoiceFilterFormGroup.get("PlantList").value &&
            this.InvoiceFilterFormGroup.get("PlantList").value.length > 0
                ? this.InvoiceFilterFormGroup.get("PlantList").value
                : this.authenticationDetails.plant ? this.authenticationDetails.plant.split(",") : [];
        isCustomer
            ? (filterPayload.UserCode = this.authenticationDetails.userCode)
            : (filterPayload.UserCode = null);

        this._reversePod.FilterAllOpenReversePODs(filterPayload).subscribe({
            next: (res) => {
                if (res.length < this.records) {
                    this.isLoadMoreVisible = false;
                } else {
                    this.isLoadMoreVisible = true;
                }
                res = this.ValueChangeEvents(res);
                this.FilteredRpodDetails = res;
                this.isProgressBarVisibile = false;
                this.dataSource = new MatTableDataSource(res);
                this.dataSource.paginator = this.paginator;
                this.updateChartValue();
            },
            error: (err) => {
                this.isProgressBarVisibile = false;
            },
        });
    }

    filterAllIntransitReversePODs(isCustomer: boolean = false) {
        this.isProgressBarVisibile = true;
        let filterPayload = new ReversePODFilter();

        filterPayload.StartDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("StartDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.EndDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("EndDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.PlantList =
            this.InvoiceFilterFormGroup.get("PlantList").value &&
            this.InvoiceFilterFormGroup.get("PlantList").value.length > 0
                ? this.InvoiceFilterFormGroup.get("PlantList").value
                : this.authenticationDetails.plant ? this.authenticationDetails.plant.split(",") : [];
        isCustomer
            ? (filterPayload.UserCode = this.authenticationDetails.userCode)
            : (filterPayload.UserCode = null);

        this._reversePod
            .FilterAllInTransitReversePODs(filterPayload)
            .subscribe({
                next: (res) => {
                    if (res.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    res = this.ValueChangeEvents(res);
                    this.FilteredRpodDetails = res;
                    this.isProgressBarVisibile = false;
                    this.dataSource = new MatTableDataSource(res);
                    this.dataSource.paginator = this.paginator;
                    this.updateChartValue();
                },
                error: (err) => {
                    this.isProgressBarVisibile = false;
                },
            });
    }

    filterAllPartiallyConfirmedReversePODs(isCustomer: boolean = false) {
        this.isProgressBarVisibile = true;
        let filterPayload = new ReversePODFilter();

        filterPayload.StartDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("StartDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.EndDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("EndDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.PlantList =
            this.InvoiceFilterFormGroup.get("PlantList").value &&
            this.InvoiceFilterFormGroup.get("PlantList").value.length > 0
                ? this.InvoiceFilterFormGroup.get("PlantList").value
                : this.authenticationDetails.plant ? this.authenticationDetails.plant.split(",") : [];
        isCustomer
            ? (filterPayload.UserCode = this.authenticationDetails.userCode)
            : (filterPayload.UserCode = null);

        this._reversePod
            .FilterAllPartiallyConfirmedReversePODs(filterPayload)
            .subscribe({
                next: (res) => {
                    if (res.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    res = this.ValueChangeEvents(res);
                    this.FilteredRpodDetails = res;
                    this.isProgressBarVisibile = false;
                    this.dataSource = new MatTableDataSource(res);
                    this.dataSource.paginator = this.paginator;
                    this.updateChartValue();
                },
                error: (err) => {
                    this.isProgressBarVisibile = false;
                },
            });
    }

    filterAllConfirmedReversePODs(isCustomer: boolean = false) {
        this.isProgressBarVisibile = true;
        let filterPayload = new ReversePODFilter();

        filterPayload.StartDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("StartDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.EndDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("EndDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.PlantList =
            this.InvoiceFilterFormGroup.get("PlantList").value &&
            this.InvoiceFilterFormGroup.get("PlantList").value.length > 0
                ? this.InvoiceFilterFormGroup.get("PlantList").value
                : this.authenticationDetails.plant ? this.authenticationDetails.plant.split(",") : [];
        isCustomer
            ? (filterPayload.UserCode = this.authenticationDetails.userCode)
            : (filterPayload.UserCode = null);

        this._reversePod
            .FilterAllConfirmedReversePODs(filterPayload)
            .subscribe({
                next: (res) => {
                    if (res.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    res = this.ValueChangeEvents(res);
                    this.FilteredRpodDetails = res;
                    this.isProgressBarVisibile = false;
                    this.dataSource = new MatTableDataSource(res);
                    this.dataSource.paginator = this.paginator;
                    this.updateChartValue();
                },
                error: (err) => {
                    this.isProgressBarVisibile = false;
                },
            });
    }

    ValueChangeEvents(res: any) {
        res.forEach((ele) => {
            ele.CUSTOMER_PENDING_QUANTITY =
                Number.parseInt(ele.QUANTITY) -
                Number.parseInt(ele.HAND_OVERED_QUANTITY);
            ele.DC_PENDING_QUANTITY =
                Number.parseInt(ele.HAND_OVERED_QUANTITY) -
                Number.parseInt(ele.RECEIEVED_QUANTITY);
        });
        console.log(res);
        return res;
    }

    getAllReversePODData() {
        this.isProgressBarVisibile = true;
        this._dashboard
            .GetAllReversePODByCustomer(this.authenticationDetails.userCode)
            .subscribe({
                next: (res) => {
                    if (res.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    res = this.ValueChangeEvents(res);
                    console.log(res);
                    this.FilteredRpodDetails = res;
                    this.isProgressBarVisibile = false;
                    this.dataSource = new MatTableDataSource(res);
                    this.dataSource.paginator = this.paginator;
                    this.updateChartValue();
                },
                error: () => {
                    this.isProgressBarVisibile = false;
                },
            });
    }

    updateChartValue() {
        let data = [0, 0, 0, 0];
        if (this.FilteredRpodDetails) {
            data = [
                this.FilteredRpodDetails.filter(
                    (x) => x.STATUS == "Open"
                ).length,
                this.FilteredRpodDetails.filter(
                    (x) => x.STATUS == "In Transit"
                ).length,
                this.FilteredRpodDetails.filter(
                    (x) => x.STATUS == "Partially Confirmed"
                ).length,
                this.FilteredRpodDetails.filter(
                    (x) => x.STATUS == "Confirmed"
                ).length,
            ];
        }

        this.doughnutChartData = data;
    }

    ConfirmReversePod(ind) {
        this.selectedIndex = ind;
        const el: HTMLElement = this.fileInput.nativeElement;
        el.click();
    }

    // handleFileInput(evt) {
    //     if (evt.target.files && evt.target.files.length > 0) {
    //         if (
    //             Math.round(Number(evt.target.files[0].size) / (1024 * 1024)) <=
    //             5
    //         ) {
    //             this.fileToUploadList = [];
    //             this.fileToUploadList.push(evt.target.files[0]);
    //             if (this.authenticationDetails.userRole == "Customer") {
    //                 this.confirmByCustomer();
    //             } else if (
    //                 this.authenticationDetails.userRole == "Amararaja User"
    //             ) {
    //                 // this.confirmByDC();
    //             }
    //         } else {
    //             this.notificationSnackBarComponent.openSnackBar(
    //                 "Please upload file size below 5 MB",
    //                 SnackBarStatus.danger
    //             );
    //         }
    //     }
    // }

    confirmByCustomer() {
        const RpodDetailsFormArray = this.RpodDetailsFormGroup.get(
            "RpodDetails"
        ) as FormArray;

        let selectedRowValue =
            RpodDetailsFormArray.controls[this.selectedIndex].value;

        if (
            selectedRowValue["LR_DATE"] != null &&
            selectedRowValue["LR_DATE"] != undefined &&
            selectedRowValue["LR_NO"]
        ) {
            let payLoad = new ReversePodUpdation();
            const RpodFormArray = this.RpodDetailsFormGroup.get(
                "RpodDetails"
            ) as FormArray;
            payLoad = RpodFormArray.controls[this.selectedIndex].value;
            payLoad.RPOD_HEADER_ID =
                this.FilteredRpodDetails[this.selectedIndex].RPOD_HEADER_ID;
            payLoad.LR_DATE = this._datePipe.transform(
                payLoad.LR_DATE,
                "yyyy-MM-dd HH:mm:ss"
            );
            payLoad.Status = 1;
            console.log("payload", payLoad);
            const formData: FormData = new FormData();

            if (this.fileToUploadList && this.fileToUploadList.length) {
                this.fileToUploadList.forEach((x) => {
                    formData.append(x.name, x, x.name);
                });
                formData.append("Payload", JSON.stringify(payLoad));
            }
            this.isProgressBarVisibile = true;
            this._reversePod.ConfirmInvoiceItems(formData).subscribe({
                next: (data) => {
                    this.getAllReversePODData();
                },
                error: () => {
                    this.isProgressBarVisibile = false;
                },
            });
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Please fill valid data for LR Details",
                SnackBarStatus.danger
            );
        }
    }

    // confirmByDC() {
    //     const RpodDetailsFormArray = this.RpodDetailsFormGroup.get(
    //         "RpodDetails"
    //     ) as FormArray;
    //     let selectedRowValue =
    //         RpodDetailsFormArray.controls[this.selectedIndex].value;
    //     if (
    //         selectedRowValue["LR_DATE"] != null &&
    //         selectedRowValue["LR_DATE"] != undefined &&
    //         selectedRowValue["LR_NO"] &&
    //         selectedRowValue["DC_RECEIEVED_DATE"] != null &&
    //         selectedRowValue["DC_RECEIEVED_DATE"] != undefined
    //     ) {
    //         let payLoad = new ReversePodUpdation();
    //         const RpodFormArray = this.RpodDetailsFormGroup.get(
    //             "RpodDetails"
    //         ) as FormArray;
    //         payLoad = RpodFormArray.controls[this.selectedIndex].value;
    //         payLoad.RPOD_HEADER_ID =
    //             this.FilteredRpodDetails[this.selectedIndex].RPOD_HEADER_ID;
    //         payLoad.DC_RECEIEVED_DATE = this._datePipe.transform(
    //             payLoad.DC_RECEIEVED_DATE,
    //             "yyyy-MM-dd HH:mm:ss"
    //         );
    //         payLoad.Status = 2;

    //         const formData: FormData = new FormData();
    //         formData.append("Payload", JSON.stringify(payLoad));
    //         if (this.fileToUploadList && this.fileToUploadList.length) {
    //             this.fileToUploadList.forEach((x) => {
    //                 formData.append(x.name, x, x.name);
    //             });
    //             this.isProgressBarVisibile = true;
    //             this._reversePod.ConfirmInvoiceItems(formData).subscribe({
    //                 next: (data) => {
    //                     this.filterAllReversePODs();
    //                 },
    //                 error: () => {
    //                     this.isProgressBarVisibile = false;
    //                 },
    //             });
    //         }
    //     } else {
    //         this.notificationSnackBarComponent.openSnackBar(
    //             "Please fill valid data for LR Details and Received date.",
    //             SnackBarStatus.danger
    //         );
    //     }
    // }

    doughnutChartClicked(e: any): void {
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex] as String;
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                console.log(clickedElementIndex, label, value);
                if (label) {
                    if (label.toLowerCase() === "pending") {
                        if (this.currentUserRole === "Amararaja User") {
                            this.filterAllOpenReversePODs();
                        } else if (this.currentUserRole === "Customer") {
                            this.filterAllOpenReversePODs(true);
                        }
                    } else if (label.toLowerCase() === "intransit") {
                        if (this.currentUserRole === "Amararaja User") {
                            this.filterAllIntransitReversePODs();
                        } else if (this.currentUserRole === "Customer") {
                            this.filterAllIntransitReversePODs(true);
                        }
                    } else if (label.toLowerCase() === "partially confirmed") {
                        if (this.currentUserRole === "Amararaja User") {
                            this.filterAllPartiallyConfirmedReversePODs();
                        } else if (this.currentUserRole === "Customer") {
                            this.filterAllPartiallyConfirmedReversePODs(true);
                        }
                    } else if (label.toLowerCase() === "confirmed") {
                        if (this.currentUserRole === "Amararaja User") {
                            this.filterAllConfirmedReversePODs();
                        } else if (this.currentUserRole === "Customer") {
                            this.filterAllConfirmedReversePODs(true);
                        }
                    }
                }
            }
        }
    }

    ViewLRDocument(AttachmentId: number, fileName: string) {
        this.isProgressBarVisibile = true;
        this._reversePod.DownloadRPODDocument(AttachmentId).subscribe({
            next: (data) => {
                this.isProgressBarVisibile = false;
                if (data) {
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
        });
    }

    ReUploadInvoiceAttachment(ind: number) {
        this.selectedIndex = ind;
        const el: HTMLElement = this.fileInput1.nativeElement;
        el.click();
    }

    // handleFileInput1(evt) {
    //     if (evt.target.files && evt.target.files.length > 0) {
    //         if (
    //             Math.round(Number(evt.target.files[0].size) / (1024 * 1024)) <=
    //             5
    //         ) {
    //             this.fileToUploadList = [];
    //             this.fileToUploadList.push(evt.target.files[0]);
    //             const formData: FormData = new FormData();
    //             formData.append(
    //                 "HeaderID",
    //                 this.dataSource.data[
    //                     this.selectedIndex
    //                 ].RPOD_HEADER_ID.toString()
    //             );
    //             if (this.fileToUploadList && this.fileToUploadList.length) {
    //                 this.fileToUploadList.forEach((x) => {
    //                     formData.append(x.name, x, x.name);
    //                 });
    //             }
    //             this.isProgressBarVisibile = true;
    //             this._reversePod.ReUploadReversePodLr(formData).subscribe({
    //                 next: (res) => {
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         "LR copy updated successfully",
    //                         SnackBarStatus.success
    //                     );
    //                 },
    //                 error: (err) => {
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         err instanceof Object
    //                             ? "Something went wrong"
    //                             : err,
    //                         SnackBarStatus.danger
    //                     );
    //                 },
    //             });
    //         } else {
    //             this.notificationSnackBarComponent.openSnackBar(
    //                 "Please upload file size below 5 MB",
    //                 SnackBarStatus.danger
    //             );
    //         }
    //     }
    // }

    // ConfirmQty(ind: number) {
    //     const RPODFORMARRAY = this.RpodDetailsFormGroup.get(
    //         "RpodDetails"
    //     ) as FormArray;
    //     var payLoad = new ReversePodUpdation();
    //     payLoad = RPODFORMARRAY.controls[ind].value;
    //     payLoad.RPOD_HEADER_ID = this.FilteredRpodDetails[ind].RPOD_HEADER_ID;
    //     payLoad.DC_RECEIEVED_DATE = this._datePipe.transform(
    //         payLoad.DC_RECEIEVED_DATE,
    //         "yyyy-MM-dd HH:mm:ss"
    //     );
    //     payLoad.Status = 2;

    //     if (payLoad.RECEIVED_QUANTITY > payLoad.HAND_OVERED_QUANTITY) {
    //         this.notificationSnackBarComponent.openSnackBar(
    //             "Received quantity can not be greater than handovered quantity",
    //             SnackBarStatus.danger
    //         );
    //     } else if (
    //         payLoad.RECEIVED_QUANTITY > this.FilteredRpodDetails[ind].Quantity
    //     ) {
    //         this.notificationSnackBarComponent.openSnackBar(
    //             "Received quantity can not be greater than actual quantity",
    //             SnackBarStatus.danger
    //         );
    //     } else {
    //         this._reversePod.ConfirmReversePodQty(payLoad).subscribe({
    //             next: (res) => {
    //                 if (res) {
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         "Quantity details updatd successfully.",
    //                         SnackBarStatus.success
    //                     );
    //                     this.filterAllReversePODs();
    //                 }
    //             },
    //             error: (err) => {
    //                 this.notificationSnackBarComponent.openSnackBar(
    //                     err instanceof Object ? "Something went wrong" : err,
    //                     SnackBarStatus.danger
    //                 );
    //             },
    //         });
    //     }
    // }

    OpenAttachmentDialog(FileName: string, blob: Blob) {
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

    exportAllAsXLSX(): void {
        this.isProgressBarVisibile = true;
        let filterPayload = new ReversePODFilter();

        filterPayload.StartDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("StartDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.EndDate = this._datePipe.transform(
            this.InvoiceFilterFormGroup.get("EndDate").value,
            "yyyy-MM-dd"
        );
        filterPayload.PlantList =
            this.InvoiceFilterFormGroup.get("PlantList").value &&
            this.InvoiceFilterFormGroup.get("PlantList").value.length > 0
                ? this.InvoiceFilterFormGroup.get("PlantList").value
                : this.authenticationDetails.plant ? this.authenticationDetails.plant.split(",") : [];

        filterPayload.UserCode =
            this.InvoiceFilterFormGroup.get("UserCode").value;
        filterPayload.CustomerName =
            this.InvoiceFilterFormGroup.get("CustomerName").value;

        this._reversePod.DownloadRpodReport(filterPayload).subscribe({
            next: (data) => {
                this.isProgressBarVisibile = false;
                const BlobFile = data as Blob;
                const currentDateTime = this._datePipe.transform(
                    new Date(),
                    "ddMMyyyyHHmmss"
                );
                const fileName = "Reverse Logistics details";
                const EXCEL_EXTENSION = ".xlsx";
                saveAs(
                    BlobFile,
                    fileName + "_" + currentDateTime + EXCEL_EXTENSION
                );
            },
            error: (err) => {
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(
                    err instanceof Object ? "Something went wrong" : err,
                    SnackBarStatus.danger
                );
            },
        });
    }

    pageSelect(event) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
    }

    getFormGroupIndex(ind: number) {
        return this.pageIndex * this.pageSize + ind;
    }

    goToReverseLogisticsItem(revLogDetails:ReversePOD){
        this._shareParameterService.setReverseLogisticDetail(revLogDetails);
        this._router.navigate(["/pages/reverseLogisticsItem"]);
    }
}
