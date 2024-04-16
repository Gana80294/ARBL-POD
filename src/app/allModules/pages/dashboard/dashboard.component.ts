import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {
    MatIconRegistry,
    MatSnackBar,
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatTabChangeEvent,
    MatOption,
} from "@angular/material";
import { Router } from "@angular/router";
import { ChartType } from "chart.js";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import {
    AuthenticationDetails,
    CustomerGroup,
    Organization,
    Plant,
    PlantGroup,
    PlantOrganizationMap,
    PlantWithOrganization,
} from "app/models/master";
import { fuseAnimations } from "@fuse/animations";
import {
    InvoiceDetails,
    ApproverDetails,
    DeliveryCount,
    InvoiceStatusCount,
    InvoiceHeaderDetail,
    FilterClass,
} from "app/models/invoice-details";
import { DashboardService } from "app/services/dashboard.service";
import { ShareParameterService } from "app/services/share-parameters.service";
import { SelectionModel } from "@angular/cdk/collections";
import { Guid } from "guid-typescript";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { MasterService } from "app/services/master.service";
import { ReportService } from "app/services/report.service";
import { IDropdownSettings } from "ng-multiselect-dropdown/multiselect.model";

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class DashboardComponent implements OnInit {
    ToDate: Date = new Date();
    fromDate: string;
    authenticationDetails: AuthenticationDetails;
    @ViewChild("allSelected3") private allSelected3: MatOption;
    currentUserID: Guid;
    currentUserRole: string;
    currentUserCode: string;
    currentUsername: string;
    MenuItems: string[];
    dropdownSettings: IDropdownSettings = {};
    isProgressBarVisibile: boolean;
    isProgressBarVisibile1: boolean;
    isProgressBarVisibile2: boolean;
    AllOrganizations: Organization[] = [];
    AllPlants: Plant[] = [];
    AllPlantGroups: PlantGroup[] = [];
    ConfirmedInvoicePercentage = 0;
    PendingInvocePercentage = 0;
    PartiallyConfirmedInvoicePercentage = 0;
    OnTimeInvoicePercentage = 0;
    LateInvoicePercentage = 0;
    AllCustomerGroups: CustomerGroup[] = [];
    FilteredCustomerGroups: CustomerGroup[] = [];
    FilteredPlants: Plant[] = [];
    AllPlantOrganizationMaps: PlantOrganizationMap[] = [];
    @ViewChild("allSelected") private allSelected: MatOption;
    @ViewChild("allSelected1") private allSelected1: MatOption;
    Divisions: string[] = [];
    allInvoicesCount: number;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    deliveryCount: DeliveryCount;
    condition: string;
    InvoiceFilterFormGroup: FormGroup;
    isDateError: boolean;
    allInvoiceDetails: InvoiceHeaderDetail[] = [];
    // allInvoiceHeaderDetails: InvoiceHeaderDetail[] = [];
    displayedColumns: string[] = [
        // 'ORGANIZATION',
        // 'DIVISION',
        // 'PLANT',
        "PLANT_NAME",
        "ODIN",
        "INV_NO",
        "INV_DATE",
        "INV_TYPE",
        "INVOICE_QUANTITY",
        "CUSTOMER",
        "CUSTOMER_NAME",
        "LR_NO",
        "LR_DATE",
        "VEHICLE_NO",
        "PROPOSED_DELIVERY_DATE",
        "VEHICLE_REPORTED_DATE",
        "ACTUAL_DELIVERY_DATE",
        "DRIVER_CONTACT",
        "TRACKING_LINK",
        "TOTAL_DISTANCE",
        "TOTAL_TRAVEL_TIME",
        "STATUS",
    ];
    dataSource = new MatTableDataSource<InvoiceHeaderDetail>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    currentLabel: string;
    currentCustomPage: number;
    records: number;
    isLoadMoreVisible: boolean;
    // Doughnut Chart
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
                // tslint:disable-next-line:typedef
                render: function (args) {
                    //  console.log(args);

                    return args.value + "\n(" + args.percentage + "%" + ")";
                },
                fontColor: "#000",
                position: "default",

                // outsidePadding: 0,
                // textMargin: 0
            },
        },
    };
    public doughnutChartType: ChartType = "doughnut";
    public doughnutChartLabels: any[] = [
        "CONFIRMED INVOICES",
        "PARTIALLY CONFIRMED INVOICES",
        "SAVED INVOICES",
        "PENDING INVOICES",
    ];
    public doughnutChartData: any[] = [];
    // public doughnutChartData: any[] = [];
    public colors: any[] = [
        { backgroundColor: ["#52de97", "#4452c6", "#fb7800", "yellow"] },
    ];

    public doughnutChartOptions1 = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: "right",
            labels: {
                fontSize: 10,

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
                // tslint:disable-next-line:typedef

                render: function (args) {
                    return args.value + "\n(" + args.percentage + "%" + ")";
                },
                fontColor: "#000",
                position: "default",
                // outsidePadding: 0,
                // textMargin: 0
            },
        },
    };
    public doughnutChartOptions2 = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: "right",
            labels: {
                fontSize: 10,

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
                // tslint:disable-next-line:typedef

                render: function (args) {
                    return args.value + "\n(" + args.percentage + "%" + ")";
                },
                fontColor: "#000",
                position: "default",
                // outsidePadding: 0,
                // textMargin: 0
            },
        },
    };
    public doughnutChartType1: ChartType = "doughnut";
    public doughnutChartType2: ChartType = "doughnut";
    public doughnutChartLabels1: any[] = ["ON TIME DELIVERY", "LATE DELIVERY"];
    public doughnutChartLabels2: any[] = ["WITHIN PDD", "BEYOND PDD"];
    public doughnutChartData1: any[] = [[0, 0]];
    public doughnutChartData2: any[] = [[0, 0]];
    // public doughnutChartData: any[] = [];
    public colors1: any[] = [{ backgroundColor: ["#52de97", "#eff54f"] }];
    public colors2: any[] = [{ backgroundColor: ["#40E0D0", "#DE3163"] }];
    CurrentFilterClass: FilterClass = new FilterClass();
    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _reportService: ReportService,
        private _masterService: MasterService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe
    ) {
        this.isProgressBarVisibile = false;
        this.isProgressBarVisibile1 = false;
        this.isProgressBarVisibile2 = false;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.deliveryCount = new DeliveryCount();
        this.condition = "InLineDelivery";
        this.isDateError = false;
        this.currentLabel = "PENDING INVOICES";
        this.currentCustomPage = 1;
        this.allInvoiceDetails = [];
        this.records = 500;
        this.isLoadMoreVisible = false;
        this.CurrentFilterClass =
            this._shareParameterService.GetDashboardFilterClass();
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = sessionStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.userID;
            this.currentUserRole = this.authenticationDetails.userRole;
            if (this.currentUserRole != "Customer") {
                this.currentUserRole = "Amararaja User";
            }
            this.currentUserCode = this.authenticationDetails.userCode;
            this.currentUsername = this.authenticationDetails.userName;
            this.MenuItems =
                this.authenticationDetails.menuItemNames.split(",");
            if (this.MenuItems.indexOf("ForwardLogistics") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
        var currDate = new Date();
        currDate.setMonth(currDate.getMonth() - 2);
        this.fromDate = currDate.toISOString().slice(0, 10);
        if (this.CurrentFilterClass) {
            this.InvoiceFilterFormGroup = this._formBuilder.group({
                StartDate: [this.CurrentFilterClass.StartDate],
                EndDate: [this.CurrentFilterClass.EndDate],
                Organization: [
                    this.CurrentFilterClass.Organization
                        ? this.CurrentFilterClass.Organization
                        : [],
                ],
                Division: [
                    this.CurrentFilterClass.Division
                        ? this.CurrentFilterClass.Division
                        : [],
                ],
                PlantList: [
                    this.CurrentFilterClass.PlantList
                        ? this.CurrentFilterClass.PlantList
                        : [],
                ],
                PlantGroupList: [],
                CustomerGroup: [
                    this.CurrentFilterClass.CustomerGroup
                        ? this.CurrentFilterClass.CustomerGroup
                        : [],
                ],
                CustomerName: [
                    this.CurrentFilterClass.CustomerName
                        ? this.CurrentFilterClass.CustomerName
                        : "",
                ],
            });
        } else {
            this.InvoiceFilterFormGroup = this._formBuilder.group({
                // Status: [''],
                StartDate: [this.fromDate],
                EndDate: [this.ToDate],
                Organization: [[]],
                Division: [[]],
                PlantList: [[]],
                PlantGroupList: [[]],
                CustomerGroup: [[]],
                CustomerName: [""],
            });
        }
        this.GetAllOrganizations();
        this.GetAllPlantGroups();
        this.GetDivisions();
        // this.GetInvoiceStatusCount();
        this.getFilteredInvoiceDetails();
        this.GetAllCustomerGroups();
        // this.GetInvoiceHeaderDetails();
        // this.LoadInitialData();
        // this.GetDeliveryCount();
        // this.GetDeliveredInvoices();
        this.dropdownSettings = {
            singleSelection: false,
            idField: "CGID",
            textField: "CustomerGroupCode",
            selectAllText: "Select All",
            unSelectAllText: "UnSelect All",
            itemsShowLimit: 1,
            allowSearchFilter: true,
        };
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    GetAllCustomerGroups(): void {
        //  this.isProgressBarVisibile = true;
        this._masterService
            .GetAllCustomerGroupsByUserID(this.authenticationDetails.userID)
            .subscribe(
                (data) => {
                    if (data) {
                        this.AllCustomerGroups = data as CustomerGroup[];

                        this.FilteredCustomerGroups = this.AllCustomerGroups;
                        //      this.isProgressBarVisibile = false;
                    }
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }

    GetAllOrganizations(): void {
        this._masterService
            .GetAllOrganizationsByUserID(this.currentUserID)
            .subscribe(
                (data) => {
                    this.AllOrganizations = data as Organization[];
                    this.GetAllPlants();
                },
                (err) => {
                    console.error(err);
                }
            );
    }

    GetAllPlants(): void {
        this._masterService.GetAllPlantsByUserID(this.currentUserID).subscribe(
            (data) => {
                this.AllPlants = data as Plant[];
                this.FilteredPlants = data as Plant[];
                this.GetAllPlantOrganizationMaps();
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetAllPlantGroups() {
        this._masterService.GetAllPlantGroups().subscribe({
            next: (res) => {
                this.AllPlantGroups = res as PlantGroup[];
            }
        })
    }

    GetAllPlantOrganizationMaps(): void {
        this._masterService.GetAllPlantOrganizationMaps().subscribe(
            (data) => {
                this.AllPlantOrganizationMaps = data as PlantWithOrganization[];
                if (this.CurrentFilterClass.Organization) {
                    this.getFilteredPlants();
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetDivisions(): void {
        this._reportService.GetDivisions().subscribe(
            (data) => {
                this.Divisions = data as string[];
                this.Divisions.forEach((div, i) => {
                    if (div == "") {
                        this.Divisions.splice(i, 1);
                    }
                });
                // this.Divisions.unshift("All");
            },
            (err) => {
                console.error(err);
                // this.isProgressBarVisibile = false;
            }
        );
    }

    GetDeliveryCount(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetDeliveryCount(this.authenticationDetails.userID)
            .subscribe(
                (data) => {
                    this.deliveryCount = data as DeliveryCount;
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

    // tabChanged(event: MatTabChangeEvent): void {
    //     this.condition =
    //         event.index === 0 ? "InLineDelivery" : "DelayedDelivery";
    //     this.GetDeliveredInvoices();
    // }

    // GetDeliveredInvoices(): void {
    //     this.isProgressBarVisibile = true;
    //     this._dashboardService
    //         .GetDeliveredInvoices(
    //             this.authenticationDetails.userID,
    //             this.condition
    //         )
    //         .subscribe(
    //             (data) => {
    //                 this.allInvoiceDetails = data as InvoiceDetails[];
    //                 this.allInvoicesCount = this.allInvoiceDetails.length;
    //                 if (this.condition === "InLineDelivery") {
    //                     this.deliveryCount.InLineDelivery = this.allInvoiceDetails.length;
    //                 } else {
    //                     this.deliveryCount.DelayedDelivery = this.allInvoiceDetails.length;
    //                 }
    //                 this.dataSource = new MatTableDataSource(
    //                     this.allInvoiceDetails
    //                 );
    //                 this.dataSource.paginator = this.paginator;
    //                 this.dataSource.sort = this.sort;
    //                 this.isProgressBarVisibile = false;
    //             },
    //             (err) => {
    //                 this.isProgressBarVisibile = false;
    //                 this.notificationSnackBarComponent.openSnackBar(
    //                     err instanceof Object ? "Something went wrong" : err,
    //                     SnackBarStatus.danger
    //                 );
    //             }
    //         );
    // }

    GetInvoiceStatusCount(): void {
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .GetInvoiceStatusCountByUserID(this.currentUserID)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.PendingInvoices);
                        // console.log("getinvoicestatuscount", this.doughnutChartData);
                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile1 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .GetInvoiceStatusCountByUserName(this.currentUserCode)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile1 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetDeliveryCounts(): void {
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .GetDeliveryCount(this.currentUserID)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .GetDeliveryCountByUsername(this.currentUserCode)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    // GetInvoiceHeaderDetails(): void {
    //     if (this.currentUserRole === "Amararaja User") {
    //         this._dashboardService
    //             .GetInvoiceHeaderDetailByUserID(this.currentUserID)
    //             .subscribe(
    //                 (data: InvoiceHeaderDetail[]) => {
    //                     this.allInvoiceHeaderDetails = data;
    //                     this.isProgressBarVisibile = false;
    //                 },
    //                 (err) => {
    //                     this.isProgressBarVisibile = false;
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         err instanceof Object
    //                             ? "Something went wrong"
    //                             : err,
    //                         SnackBarStatus.danger
    //                     );
    //                 }
    //             );
    //     } else if (this.currentUserRole === "Customer") {
    //         this._dashboardService
    //             .GetInvoiceHeaderDetailByUsername(this.currentUserCode)
    //             .subscribe(
    //                 (data: InvoiceHeaderDetail[]) => {
    //                     this.allInvoiceHeaderDetails = data;
    //                     this.isProgressBarVisibile = false;
    //                 },
    //                 (err) => {
    //                     this.isProgressBarVisibile = false;
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         err instanceof Object
    //                             ? "Something went wrong"
    //                             : err,
    //                         SnackBarStatus.danger
    //                     );
    //                 }
    //             );
    //     }
    // }
    LoadInitialData(): void {
        if (this.currentUserRole === "Amararaja User") {
            this.FilterPendingInvoices();
        } else if (this.currentUserRole === "Customer") {
            this.FilterPendingInvoicesByUser();
        }
    }

    toggleAllSelection3(): void {
        if (this.allSelected3.selected) {
            const pls = this.FilteredCustomerGroups.map(
                (x) => x.CustomerGroupCode
            );
            pls.push("all");
            this.InvoiceFilterFormGroup.get("CustomerGroup").patchValue(pls);
        } else {
            this.InvoiceFilterFormGroup.get("CustomerGroup").patchValue([]);
        }
    }

    toggleSalesGrpPerOne() {
        if (this.allSelected3.selected) {
            this.allSelected3.deselect();
            return false;
        }
        if (this.InvoiceFilterFormGroup.get("CustomerGroup").value.length) {
            if (
                this.InvoiceFilterFormGroup.get("CustomerGroup").value
                    .length === this.AllCustomerGroups.length
            ) {
                this.allSelected3.select();
            }
        }
    }
    SearchInvoices(): void {
        this.currentLabel = "PENDING INVOICES";
        this.currentCustomPage = 1;
        this.allInvoiceDetails = [];
        this.getFilteredInvoiceDetails();
    }
    getFilteredInvoiceDetails(): void {
        if (this.InvoiceFilterFormGroup.valid) {
            if (!this.isDateError) {
                this.currentCustomPage = 1;
                this.FilterInvoiceStatusCount();
                this.FilterDeliveryCount();
                this.FilterLeadTimeCount();
            }
        } else {
            Object.keys(this.InvoiceFilterFormGroup.controls).forEach((key) => {
                this.InvoiceFilterFormGroup.get(key).markAsTouched();
                this.InvoiceFilterFormGroup.get(key).markAsDirty();
            });
        }
    }
    GetFiltereClass() {
        var Organization1 = this.InvoiceFilterFormGroup.get("Organization")
            .value as any[];
        var Division = this.InvoiceFilterFormGroup.get("Division")
            .value as any[];
        let plList = this.InvoiceFilterFormGroup.get("PlantList")
            .value as string[];
        let plGrpList = this.InvoiceFilterFormGroup.get("PlantGroupList").value as string[];
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        let CustomerGroup = null;
        const cstgrp = this.InvoiceFilterFormGroup.get("CustomerGroup")
            .value as any[];
        if (cstgrp) {
            CustomerGroup = cstgrp;
        }
        let CustomerName = null;
        const cstname = this.InvoiceFilterFormGroup.get("CustomerName").value;
        if (cstname) {
            CustomerName = cstname;
        }
        if (!this.CurrentFilterClass) {
            this.CurrentFilterClass = new FilterClass();
        }
        this.CurrentFilterClass.StartDate = StartDate;
        this.CurrentFilterClass.EndDate = EndDate;
        this.CurrentFilterClass.Organization =
            Organization1.length > 0 ? Organization1 : [];
        this.CurrentFilterClass.Division = Division.length > 0 ? Division : [];
        this.CurrentFilterClass.PlantList = (plList && plList.length > 0) ? plList : [];
        this.CurrentFilterClass.PlantGroupList = (plGrpList && plGrpList.length) > 0 ? plGrpList : [];
        this.CurrentFilterClass.UserID = this.authenticationDetails.userID;
        this.CurrentFilterClass.CustomerGroup =
            CustomerGroup.length > 0 ? CustomerGroup : [];
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.CurrentFilterClass.Records = this.records;
        this.CurrentFilterClass.CustomerName = CustomerName;
        this._shareParameterService.SetDashboardFilterClass(
            this.CurrentFilterClass
        );
    }
    FilterInvoiceStatusCount(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile1 = true;
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterInvoicesStatusCount(this.CurrentFilterClass)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        var chartData = [];
                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.SavedInvoices);
                        chartData.push(data.PendingInvoices);
                        // this.ConfirmedInvoicePercentage = (data.ConfirmedInvoices / (data.TotalInvoices)) * 100;
                        // this.PendingInvocePercentage = (data.PendingInvoices / (data.TotalInvoices)) * 100;
                        // this.PartiallyConfirmedInvoicePercentage = (data.PartiallyConfirmedInvoices / (data.TotalInvoices)) * 100;
                        // console.log(this.ConfirmedInvoicePercentage, this.PartiallyConfirmedInvoicePercentage, this.PendingInvocePercentage);

                        // this.doughnutChartLabels = [];
                        // this.doughnutChartLabels.push(
                        //     "CONFIRMED INVOICES (" + this.ConfirmedInvoicePercentage + "%)"
                        // );
                        // this.doughnutChartLabels.push(
                        //     "PARTIALLY CONFIRMED INVOICES (" + this.PartiallyConfirmedInvoicePercentage + "%)"
                        // );
                        // this.doughnutChartLabels.push(
                        //     "PENDING INVOICES (" + this.PendingInvocePercentage + "%)"
                        // );
                        this.doughnutChartData = chartData;
                        // console.log("FilterInvoiceStatusCount", this.doughnutChartData);
                        this.isProgressBarVisibile1 = false;

                        this.FilterPendingInvoices();
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            let StartDate = null;
            const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
            if (staDate) {
                StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
            }
            let EndDate = null;
            const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
            if (enDate) {
                EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
            }
            this._dashboardService
                .FilterInvoiceStatusCountByUser(
                    this.currentUserCode,
                    StartDate,
                    EndDate
                )
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];
                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.SavedInvoices);
                        chartData.push(data.PendingInvoices);
                        // this.ConfirmedInvoicePercentage = (data.ConfirmedInvoices / (data.TotalInvoices)) * 100;
                        // this.PendingInvocePercentage = (data.PendingInvoices / (data.TotalInvoices)) * 100;
                        // this.PartiallyConfirmedInvoicePercentage = (data.PartiallyConfirmedInvoices / (data.TotalInvoices)) * 100;
                        // this.doughnutChartLabels = [];
                        // this.doughnutChartLabels.push(
                        //     "CONFIRMED INVOICES (" + this.ConfirmedInvoicePercentage + "%)"
                        // );
                        // this.doughnutChartLabels.push(
                        //     "PARTIALLY CONFIRMED INVOICES (" + this.PartiallyConfirmedInvoicePercentage + "%)"
                        // );
                        // this.doughnutChartLabels.push(
                        //     "PENDING INVOICES (" + this.PendingInvocePercentage + "%)"
                        // );
                        this.doughnutChartData = chartData;
                        this.isProgressBarVisibile1 = false;
                        this.FilterPendingInvoicesByUser();
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    FilterDeliveryCount(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.GetFiltereClass();
        this.isProgressBarVisibile2 = true;
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterDeliverysCount(this.CurrentFilterClass)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .FilterDeliveryCountByUser(
                    this.currentUserCode,
                    StartDate,
                    EndDate
                )
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    FilterLeadTimeCount(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.GetFiltereClass();
        this.isProgressBarVisibile2 = true;
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterLeadTimeCount(this.CurrentFilterClass)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data[1]);
                        chartData.push(data[2]);

                        this.doughnutChartData2 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .FilterLeadTimeCountByUser(
                    this.currentUserCode,
                    StartDate,
                    EndDate
                )
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data[1]);
                        chartData.push(data[2]);

                        this.doughnutChartData2 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }
    getFilteredPlants(): void {
        const org = this.InvoiceFilterFormGroup.get("Organization")
            .value as string;
        if (org) {
            if (org !== "all") {
                const plantOrgMap = this.AllPlantOrganizationMaps.filter(
                    (o) => o.OrganizationCode === org
                );
                this.FilteredPlants = this.AllPlants.filter((o) =>
                    plantOrgMap.some((y) => o.PlantCode === y.PlantCode)
                );
                const pl = this.InvoiceFilterFormGroup.get("PlantList")
                    .value as string[];
                if (pl && pl.length) {
                    this.InvoiceFilterFormGroup.get("PlantList").patchValue([]);
                    let pla: string[] = [];
                    pl.forEach((x) => {
                        const index = this.FilteredPlants.findIndex(
                            (y) => y.PlantCode === x
                        );
                        if (index >= 0) {
                            pla.push(x);
                        }
                    });
                    this.InvoiceFilterFormGroup.get("PlantList").patchValue(
                        pla
                    );
                    this.togglePerOne();
                }
            } else {
                this.FilteredPlants = this.AllPlants.filter((y) => y.PlantCode);
                this.togglePerOne();
            }
        }
    }
    togglePerOne1(): boolean | void {
        // if (this.allSelected1.selected) {
        //   this.allSelected1.deselect();
        //   this.getFilteredPlants();
        //   return false;
        // }
        // if (this.InvoiceFilterFormGroup.get('OrganizationList').value.length) {
        //   if (this.InvoiceFilterFormGroup.get('OrganizationList').value.length === this.AllOrganizations.length) {
        //     this.allSelected1.select();
        //   }
        // }
        this.getFilteredPlants();
    }
    toggleAllSelection1(): void {
        // if (this.allSelected1.selected) {
        //   const pls = this.AllOrganizations.map(x => x.OrganizationCode);
        //   pls.push("all");
        //   this.InvoiceFilterFormGroup.get('OrganizationList').patchValue(pls);
        // } else {
        //   this.InvoiceFilterFormGroup.get('OrganizationList').patchValue([]);
        // }
        this.getFilteredPlants();
    }
    togglePerOne(): boolean | void {
        if (this.allSelected.selected) {
            this.allSelected.deselect();
            return false;
        }
        if (this.InvoiceFilterFormGroup.get("PlantList").value.length) {
            if (
                this.InvoiceFilterFormGroup.get("PlantList").value.length ===
                this.FilteredPlants.length
            ) {
                this.allSelected.select();
            }
        }
    }
    toggleAllSelection(): void {
        if (this.allSelected.selected) {
            const pls = this.FilteredPlants.map((x) => x.PlantCode);
            pls.push("all");
            this.InvoiceFilterFormGroup.get("PlantList").patchValue(pls);
        } else {
            this.InvoiceFilterFormGroup.get("PlantList").patchValue([]);
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

    GoToInvoiceItem(invoiceDetails: InvoiceDetails): void {
        // const invoiceDetails: InvoiceDetails = new InvoiceDetails();
        // invoiceDetails.HEADER_ID = inv.HEADER_ID;
        // invoiceDetails.INV_NO = inv.INV_NO;
        // invoiceDetails.ODIN = inv.ODIN;
        // invoiceDetails.INV_DATE = inv.INV_DATE;
        // invoiceDetails.INV_TYPE = inv.INV_TYPE;
        // invoiceDetails.PLANT = inv.PLANT;
        // invoiceDetails.VEHICLE_NO = inv.VEHICLE_NO;
        // invoiceDetails.EWAYBILL_NO = inv.EWAYBILL_NO;
        // invoiceDetails.OUTBOUND_DELIVERY = inv.OUTBOUND_DELIVERY;
        // invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
        // invoiceDetails.STATUS = inv.STATUS;
        this._shareParameterService.SetInvoiceDetail(invoiceDetails);
        this._router.navigate(["/pages/invItem"]);
    }

    doughnutChartClicked(e: any): void {
        // console.log(e);
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex] as String;
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                // console.log(clickedElementIndex, label, value);
                if (label) {
                    if (label.toLowerCase() === "pending invoices") {
                        this.currentLabel = "PENDING INVOICES";
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterPendingInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterPendingInvoicesByUser();
                        }
                    }
                    if (label.toLowerCase() === "saved invoices") {
                        this.currentLabel = "SAVED INVOICES";
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterSavedInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterSavedInvoicesByUser();
                        }
                    } else if (label.toLowerCase() === "confirmed invoices") {
                        this.currentLabel = "CONFIRMED INVOICES";
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterConfirmedInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterConfirmedInvoicesByUser();
                        }
                    } else if (
                        label.toLowerCase() === "partially confirmed invoices"
                    ) {
                        this.currentLabel = "PARTIALLY CONFIRMED INVOICES";
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterPartiallyConfirmedInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterPartiallyConfirmedInvoicesByUser();
                        }
                    }
                }
            }
        }
    }
    doughnutChart1Clicked(e: any): void {
        // console.log(e);
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex] as String;
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                // console.log(clickedElementIndex, label, value);
                if (label.toLowerCase() === "on time delivery") {
                    this.currentLabel = "ON TIME DELIVERY";
                    this.currentCustomPage = 1;
                    this.allInvoiceDetails = [];
                    if (this.currentUserRole === "Amararaja User") {
                        this.FilterOnTimeDeliveryInvoices();
                    } else if (this.currentUserRole === "Customer") {
                        this.FilterOnTimeDeliveryInvoicesByUser();
                    }
                } else if (label.toLowerCase() === "late delivery") {
                    this.currentLabel = "LATE DELIVERY";
                    this.currentCustomPage = 1;
                    this.allInvoiceDetails = [];
                    if (this.currentUserRole === "Amararaja User") {
                        this.FilterLateDeliveryInvoices();
                    } else if (this.currentUserRole === "Customer") {
                        this.FilterLateDeliveryInvoicesByUser();
                    }
                }
            }
        }
    }
    doughnutChart2Clicked(e: any): void {
        // console.log(e);
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex] as String;
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                // console.log(clickedElementIndex, label, value);
                if (label.toLowerCase() === "within pdd") {
                    this.currentLabel = "WITHIN PDD";
                    this.currentCustomPage = 1;
                    this.allInvoiceDetails = [];
                    if (this.currentUserRole === "Amararaja User") {
                        this.FilterWithinLeadTimeInvoices();
                    } else if (this.currentUserRole === "Customer") {
                        this.FilterLeadTimeInvoicesByUser("within");
                    }
                } else if (label.toLowerCase() === "beyond pdd") {
                    this.currentLabel = "BEYOND PDD";
                    this.currentCustomPage = 1;
                    this.allInvoiceDetails = [];
                    if (this.currentUserRole === "Amararaja User") {
                        this.FilterBeyondLeadTimeInvoices();
                    } else if (this.currentUserRole === "Customer") {
                        this.FilterLeadTimeInvoicesByUser("beyond");
                    }
                }
            }
        }
    }
    LoadMoreData(): void {
        if (this.currentLabel.toLowerCase() === "pending invoices") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterPendingInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterPendingInvoicesByUser();
            }
        }
        if (this.currentLabel.toLowerCase() === "saved invoices") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterSavedInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterSavedInvoicesByUser();
            }
        } else if (this.currentLabel.toLowerCase() === "confirmed invoices") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterConfirmedInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterConfirmedInvoicesByUser();
            }
        } else if (
            this.currentLabel.toLowerCase() === "partially confirmed invoices"
        ) {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterPartiallyConfirmedInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterPartiallyConfirmedInvoicesByUser();
            }
        } else if (this.currentLabel.toLowerCase() === "on time delivery") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterOnTimeDeliveryInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterOnTimeDeliveryInvoicesByUser();
            }
        } else if (this.currentLabel.toLowerCase() === "late delivery") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterLateDeliveryInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterLateDeliveryInvoicesByUser();
            }
        } else if (this.currentLabel.toLowerCase() === "within pdd") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterWithinLeadTimeInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterLeadTimeInvoicesByUser("within");
            }
        } else if (this.currentLabel.toLowerCase() === "beyond pdd") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterBeyondLeadTimeInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterLeadTimeInvoicesByUser("beyond");
            }
        }
    }
    FilterConfirmedInvoices(): void {
        this.GetFiltereClass();
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterConfirmedInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterPartiallyConfirmedInvoices(): void {
        this.GetFiltereClass();
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterPartiallyConfirmedInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterPendingInvoices(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterPendingInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterSavedInvoices(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterSavedInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterOnTimeDeliveryInvoices(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterOnTimeDeliveryInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterLateDeliveryInvoices(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterLateDeliveryInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterConfirmedInvoicesByUser(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterConfirmedInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterPartiallyConfirmedInvoicesByUser(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterPartiallyConfirmedInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterPendingInvoicesByUser(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterPendingInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterSavedInvoicesByUser(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterSavedInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterOnTimeDeliveryInvoicesByUser(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterOnTimeDeliveryInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterLateDeliveryInvoicesByUser(): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterLateDeliveryInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterLeadTimeInvoicesByUser(LeadTime: string): void {
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get("StartDate").value;
        if (staDate) {
            StartDate = this._datePipe.transform(staDate, "yyyy-MM-dd");
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get("EndDate").value;
        if (enDate) {
            EndDate = this._datePipe.transform(enDate, "yyyy-MM-dd");
        }
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterLeadTimeInvoicesByUser(
                this.currentUserCode,
                this.currentCustomPage,
                this.records,
                LeadTime,
                StartDate,
                EndDate
            )
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterWithinLeadTimeInvoices(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterWithinLeadTimeInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    FilterBeyondLeadTimeInvoices(): void {
        this.GetFiltereClass();
        this.isProgressBarVisibile = true;
        this._dashboardService
            .FilterBeyondLeadTimeInvoices(this.CurrentFilterClass)
            .subscribe(
                (data) => {
                    const data1 = data as InvoiceHeaderDetail[];
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
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
                    );
                    this.dataSource.paginator = this.paginator;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
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
