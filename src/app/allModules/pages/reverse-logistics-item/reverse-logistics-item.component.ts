import {
    trigger,
    state,
    style,
    transition,
    animate,
} from "@angular/animations";
import { DatePipe, DecimalPipe } from "@angular/common";
import {
    Component,
    ElementRef,
    OnInit,
    Renderer,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import {
    FormGroup,
    FormArray,
    AbstractControl,
    FormBuilder,
    Validators,
    FormControl,
} from "@angular/forms";
import {
    MatDialog,
    MatDialogConfig,
    MatPaginator,
    MatSnackBar,
    MatSort,
    MatTableDataSource,
} from "@angular/material";
import { Router } from "@angular/router";
import { AttachmentDialogComponent } from "app/allModules/reports/attachment-dialog/attachment-dialog.component";
import {
    AttachmentDetails,
    AttachmentResponse,
    AttachmentStatus,
    InvoiceDetails,
    InvoiceItemDetails,
    InvoiceUpdation,
    LRWithVehicleUnloaded,
    ReversePOD,
    ReversePodItemUpdation,
    ReversePodLrDetails,
    ReversePodMaterialDetail,
    ReversePodUpdation,
} from "app/models/invoice-details";
import {
    AuthenticationDetails,
    Reason,
    ChangesDetected,
    UserActionHistory,
    Itemchanges,
} from "app/models/master";
import { NotificationDialogComponent } from "app/notifications/notification-dialog/notification-dialog.component";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/snackbar-status-enum";
import { DashboardService } from "app/services/dashboard.service";
import { FileSaverService } from "app/services/file-saver.service";
import { InvoiceService } from "app/services/invoice.service";
import { MasterService } from "app/services/master.service";
import { ReversePodService } from "app/services/reverse-pod.service";
import { ShareParameterService } from "app/services/share-parameters.service";
import { Guid } from "guid-typescript";
import { forkJoin } from "rxjs";

@Component({
    selector: "app-reverse-logistics-item",
    templateUrl: "./reverse-logistics-item.component.html",
    styleUrls: ["./reverse-logistics-item.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger("detailExpand1", [
            state(
                "collapsed",
                style({ height: "0px", minHeight: "0", display: "none" })
            ),
            state("expanded", style({ height: "*" })),
            transition(
                "expanded <=> collapsed",
                animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
            ),
        ]),
    ],
})
export class ReverseLogisticsItemComponent implements OnInit {
    selectedReverseLogisticDetail: ReversePOD;
    reverseLogisticsItemFormGroup: FormGroup;
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserCode: string;
    currentUserRole: string;
    MenuItems: string[];
    isProgressBarVisibile: boolean;
    isFormValid: boolean = true;
    minDate: Date;
    maxDate: Date;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    SelectedInvoiceDetail: InvoiceDetails;
    InvoiceItemDetailsList: InvoiceItemDetails[] = [];
    InvoiceItemDetailsDisplayedColumns: string[] = [
        // 'ITEM_ID',
        "ITEM_NO",
        "HEADER_ID",
        "MATERIAL_CODE",
        "MATERIAL_DESCRIPTION",
        "QUANTITY",
        "QUANTITY_UOM",
        "LR_NO",
        "LR_DATE",
        "FWD_AGENT",
        "CARRIER",
        "FREIGHT_ORDER",
        "FREIGHT_ORDER_DATE",
    ];
    InvoiceItemDetailsDataSource = new MatTableDataSource<InvoiceItemDetails>();

    LrDetailsDisplayColumns: string[] = [
        "LR_NO",
        "LR_DATE",
        "DC_RECEIEVED_DATE",
        "DC_ACKNOWLEDGEMENT_DATE",
        "CUSTOMER_DOC_ID",
        "DC_DOC_ID",
    ];
    LrDetailDataSource = new MatTableDataSource<ReversePodLrDetails>();
    LrDetailColNames = {
        LR_NO: "LR No",
        LR_DATE: "LR Date",
        DC_RECEIEVED_DATE: "DC Receieved Date",
        DC_ACKNOWLEDGEMENT_DATE: "DC Acknowledgement Date",
        CUSTOMER_DOC_ID: "Customer LR",
        DC_DOC_ID: "DC LR",
    };

    displayedColumns: string[] = [
        "MATERIAL_CODE",
        "QUANTITY",
        "HAND_OVERED_QUANTITY",
        "CUSTOMER_PENDING_QUANTITY",
        "RECEIVED_QUANTITY",
        "DC_PENDING_QUANTITY",
        "STATUS",
        "REMARKS",
        "WARRANTY_DETAILS",
    ];
    rPodMaterialDetails: ReversePodMaterialDetail[] = [];
    dataSource = new MatTableDataSource<ReversePodMaterialDetail>(
        this.rPodMaterialDetails
    );

    warrantyDataColumns: string[] = [
        "TOTAL_QUANTITY",
        "BILLED_QUANTITY",
        "BALANCE_QUANTITY",
        "INV_NO",
        "SUPPLIED_QUANTITY",
    ];
    expandedElement: ReversePodMaterialDetail | null;

    @ViewChild(MatPaginator) InvoiceItemDetailsPaginator: MatPaginator;
    @ViewChild(MatSort) InvoiceItemDetailsSort: MatSort;
    @ViewChild("reversePodFileInput") fileInput: ElementRef<HTMLElement>;
    @ViewChild("fileInput1") fileInput1: ElementRef<HTMLElement>;
    fileToUpload: File;
    fileToUploadList: File[] = [];
    InvoiceItemFormGroup: FormGroup;

    remarkOptions: any[] = ["Partially Confirmed", "Confirmed"];

    AllReasons: Reason[] = [];
    // ReasonTemplates: string[] = [];
    AttachmentId: number = 0;

    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _reversePodService: ReversePodService,
        private _fileSaver: FileSaverService
    ) {}

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
            this.initialActivities();
        } else {
            this._router.navigate(["/auth/login"]);
        }
    }

    initialActivities() {
        this.reverseLogisticsItemFormGroup = this._formBuilder.group({
            LR_NO: ["", [Validators.required]],
            LR_DATE: ["", [Validators.required]],
            DC_RECEIEVED_DATE: ["", [Validators.required]],
            RPodItemArray: this._formBuilder.array([]),
        });

        this.selectedReverseLogisticDetail =
            this._shareParameterService.getReverseLogisticDetail();

        if (!this.selectedReverseLogisticDetail) {
            this._router.navigate(["pages/deliverychallan"]);
        }

        this.reverseLogisticsItemFormGroup.patchValue({
            LR_NO: this.selectedReverseLogisticDetail.LR_NO,
            LR_DATE: this.selectedReverseLogisticDetail.LR_DATE,
            DC_RECEIEVED_DATE:
                this.selectedReverseLogisticDetail.DC_RECEIEVED_DATE,
        });

        //get material details api call
        this.getReversePodMaterialDetails(
            this.selectedReverseLogisticDetail.RPOD_HEADER_ID
        );

        this.getReversePodLRDetails(
            this.selectedReverseLogisticDetail.RPOD_HEADER_ID
        );
    }

    addRpodForm(materialDetail: ReversePodMaterialDetail) {
        console.log(materialDetail);
        let receivedQty1: number = 0;
        if (this.currentUserRole == "Customer") {
            receivedQty1 = 0;
        } else {
            receivedQty1 = materialDetail.HAND_OVERED_QUANTITY
                ? materialDetail.HAND_OVERED_QUANTITY
                : materialDetail.QUANTITY;
        }

        console.log(materialDetail.HAND_OVERED_QUANTITY);
        let materialForm = this._formBuilder.group({
            HAND_OVERED_QUANTITY: [
                materialDetail.HAND_OVERED_QUANTITY
                    ? materialDetail.HAND_OVERED_QUANTITY
                    : materialDetail.QUANTITY,
                [Validators.required],
            ],
            RECEIVED_QUANTITY: [receivedQty1, [Validators.required]],
            REMARKS: [materialDetail.REMARKS ? materialDetail.REMARKS : ""],
        });
        // console.log('mf', materialForm);

        if (this.currentUserRole == "Customer") {
            materialForm.get("RECEIVED_QUANTITY").disable();
            materialForm.get("REMARKS").disable();
            this.reverseLogisticsItemFormGroup
                .get("DC_RECEIEVED_DATE")
                .disable();
        }
        (
            this.reverseLogisticsItemFormGroup.get("RPodItemArray") as FormArray
        ).push(materialForm);
        console.log(this.reverseLogisticsItemFormGroup);
    }

    getReversePodMaterialDetails(headerID: number) {
        this._dashboardService.getReversePodMaterialDetails(headerID).subscribe(
            (res) => {
                if (res) {
                    this.rPodMaterialDetails =
                        res as ReversePodMaterialDetail[];
                    this.rPodMaterialDetails.forEach((element) => {
                        element.STATUS =
                            element.STATUS == "Open"
                                ? "Confirmed"
                                : element.STATUS;
                        this.addRpodForm(element);
                    });
                    console.log(this.reverseLogisticsItemFormGroup);
                    console.log(this.rPodMaterialDetails);
                    this.dataSource = new MatTableDataSource(
                        this.rPodMaterialDetails
                    );
                    console.log(this.dataSource);
                }
            },
            (err) => {}
        );
    }

    getReversePodLRDetails(headerID: number) {
        this._dashboardService.getReversePodLrDetails(headerID).subscribe(
            (res) => {
                if (res) {
                    this.LrDetailDataSource = new MatTableDataSource(
                        res as ReversePodLrDetails[]
                    );
                }
            },
            (err) => {}
        );
    }

    handOveredQtyValidation(event, actualQty: number, index: number) {
        let handOveredQty = event.target.value;
        console.log(this.dataSource);
        console.log(handOveredQty, actualQty, index);
        console.log(this.dataSource.data[index]);
        if (handOveredQty == actualQty) {
            this.dataSource.data[index].STATUS = "Confirmed";
        } else if (handOveredQty < actualQty) {
            this.dataSource.data[index].STATUS = "Partially Confirmed";
        }
        console.log(this.dataSource.data[index]);
        this.dataSource._updateChangeSubscription();
    }

    receivedQtyValidation(
        event,
        hqty: number,
        actualQty: number,
        index: number
    ) {
        let receivedQty = event.target.value;

        if (receivedQty == hqty && hqty == actualQty) {
            this.dataSource.data[index].STATUS = "Confirmed";
        }
        if (receivedQty < hqty || hqty < actualQty) {
            this.dataSource.data[index].STATUS = "Partially Confirmed";
        }
        this.dataSource._updateChangeSubscription();
    }

    confirmReversePOD() {
        if (this.reverseLogisticsItemFormGroup.valid && this.isValidForm()) {
            const el: HTMLElement = this.fileInput.nativeElement;
            el.click();
        } else {
            this.ShowValidationErrors(this.reverseLogisticsItemFormGroup);
        }
    }

    isValidForm() {
        let rPOdFormArray = (
            this.reverseLogisticsItemFormGroup.get("RPodItemArray") as FormArray
        ).controls;

        // this.dataSource.data.forEach((element,i)=>{
        //   if(element.QUANTITY < rPOdFormArray[i].value.HAND_OVERED_QUANTITY){
        //     console.log(1);
        //     return false;
        //   }
        //   else if (rPOdFormArray[i].value.HAND_OVERED_QUANTITY < 0) {
        //     console.log(2)
        //     return false;
        //   }
        //   else{
        //     return true;
        //   }
        // })

        for (let i = 0; i < this.dataSource.data.length; i++) {
            if (
                this.dataSource.data[i].QUANTITY <
                rPOdFormArray[i].value.HAND_OVERED_QUANTITY
            ) {
                return false;
            } else if (rPOdFormArray[i].value.HAND_OVERED_QUANTITY < 0) {
                return false;
            } else if (
                this.currentUserRole != "Customer" &&
                rPOdFormArray[i].value.HAND_OVERED_QUANTITY <
                    rPOdFormArray[i].value.RECEIVED_QUANTITY
            ) {
                return false;
            } else if (rPOdFormArray[i].value.RECEIVED_QUANTITY < 0) {
                return false;
            } else {
                return true;
            }
        }
    }

    ShowValidationErrors(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key) => {
            if (!formGroup.get(key).valid) {
            }
            formGroup.get(key).markAsTouched();
            formGroup.get(key).markAsDirty();
            if (formGroup.get(key) instanceof FormArray) {
                const FormArrayControls = formGroup.get(key) as FormArray;
                Object.keys(FormArrayControls.controls).forEach((key1) => {
                    if (FormArrayControls.get(key1) instanceof FormGroup) {
                        const FormGroupControls = FormArrayControls.get(
                            key1
                        ) as FormGroup;
                        Object.keys(FormGroupControls.controls).forEach(
                            (key2) => {
                                FormGroupControls.get(key2).markAsTouched();
                                FormGroupControls.get(key2).markAsDirty();
                                if (!FormGroupControls.get(key2).valid) {
                                }
                            }
                        );
                    } else {
                        FormArrayControls.get(key1).markAsTouched();
                        FormArrayControls.get(key1).markAsDirty();
                    }
                });
            }
        });
    }

    confirmRpod() {
        let payLoad = new ReversePodUpdation();

        payLoad.RPOD_HEADER_ID =
            this.selectedReverseLogisticDetail.RPOD_HEADER_ID;
        payLoad.LR_NO = this.reverseLogisticsItemFormGroup.value["LR_NO"];
        payLoad.LR_DATE = this.reverseLogisticsItemFormGroup.value["LR_DATE"];
        payLoad.DC_RECEIEVED_DATE =
            this.reverseLogisticsItemFormGroup.get("DC_RECEIEVED_DATE").value;
        payLoad.LR_DATE = this._datePipe.transform(
            payLoad.LR_DATE,
            "yyyy-MM-dd HH:mm:ss"
        );
        payLoad.DC_RECEIEVED_DATE = this._datePipe.transform(
            payLoad.DC_RECEIEVED_DATE,
            "yyyy-MM-dd HH:mm:ss"
        );
        payLoad.Code = this.currentUserRole == "Customer" ? 1 : 2;
        payLoad.DC_ACKNOWLEDGEMENT_DATE =
            this.selectedReverseLogisticDetail.DC_ACKNOWLEDGEMENT_DATE;
        payLoad.STATUS = this.selectedReverseLogisticDetail.STATUS;
        payLoad.STATUS =
            this.currentUserRole == "Customer"
                ? "In Transit"
                : this.dataSource.data.some((x) =>
                      x.STATUS.toLowerCase().includes("partially confirmed")
                  )
                ? "Partially Confirmed"
                : "Confirmed";

        const RPODFORMARRAY = this.reverseLogisticsItemFormGroup.get(
            "RPodItemArray"
        ) as FormArray;
        payLoad.MATERIALS = [];
        this.dataSource.data.forEach((element, i) => {
            let rpodItem = new ReversePodItemUpdation();
            rpodItem = RPODFORMARRAY.controls[i].value;
            rpodItem.RECEIVED_QUANTITY =
                RPODFORMARRAY.controls[i].get("RECEIVED_QUANTITY").value;
            rpodItem.REMARKS = RPODFORMARRAY.controls[i].get("REMARKS").value;
            rpodItem.MATERIAL_CODE = element.MATERIAL_CODE;
            rpodItem.MATERIAL_ID = element.MATERIAL_ID;
            rpodItem.STATUS = element.STATUS;
            payLoad.MATERIALS.push(rpodItem);
        });

        const FORMDATA: FormData = new FormData();

        if (this.fileToUploadList && this.fileToUploadList.length) {
            this.fileToUploadList.forEach((x) => {
                FORMDATA.append(x.name, x, x.name);
            });
            FORMDATA.append("Payload", JSON.stringify(payLoad));
        }
        this.isProgressBarVisibile = true;
        this._reversePodService.confirmReversePod(FORMDATA).subscribe({
            next: (res) => {
                this.isProgressBarVisibile = false;
                this._router.navigate(["pages/deliverychallan"]);
            },
            error: (err) => {
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(
                    err,
                    SnackBarStatus.danger
                );
            },
        });
        this.isProgressBarVisibile = false;
    }

    handleFileInput(evt) {
        if (evt.target.files && evt.target.files.length > 0) {
            if (
                Math.round(Number(evt.target.files[0].size) / (1024 * 1024)) <=
                5
            ) {
                this.fileToUploadList = [];
                this.fileToUploadList.push(evt.target.files[0]);
                this.confirmRpod();
                // if (this.authenticationDetails.userRole == "Customer") {
                //   this.confirmByCustomer();
                // } else if (
                //   this.authenticationDetails.userRole == "Amararaja User"
                // ) {
                //   this.confirmByDC();
                // }
            } else {
                this.notificationSnackBarComponent.openSnackBar(
                    "Please upload file size below 5 MB",
                    SnackBarStatus.danger
                );
            }
        }
    }

    confirmByCustomer() {
        const RpodDetailsFormArray = this.reverseLogisticsItemFormGroup.get(
            "RPodItemArray"
        ) as FormArray;

        // let selectedRowValue =
        //     RpodDetailsFormArray.controls[this.selectedIndex].value;

        // if (
        //     selectedRowValue["LR_DATE"] != null &&
        //     selectedRowValue["LR_DATE"] != undefined &&
        //     selectedRowValue["LR_NO"]
        // ) {
        //     let payLoad = new ReversePodUpdation();
        //     const RpodFormArray = this.RpodDetailsFormGroup.get(
        //         "RpodDetails"
        //     ) as FormArray;
        //     payLoad = RpodFormArray.controls[this.selectedIndex].value;
        //     payLoad.RPOD_HEADER_ID =
        //         this.FilteredRpodDetails[this.selectedIndex].RPOD_HEADER_ID;
        //     payLoad.LR_DATE = this._datePipe.transform(
        //         payLoad.LR_DATE,
        //         "yyyy-MM-dd HH:mm:ss"
        //     );
        //     payLoad.Status = 1;
        //     console.log("payload", payLoad);
        //     const formData: FormData = new FormData();

        //     if (this.fileToUploadList && this.fileToUploadList.length) {
        //         this.fileToUploadList.forEach((x) => {
        //             formData.append(x.name, x, x.name);
        //         });
        //         formData.append("Payload", JSON.stringify(payLoad));
        //     }
        //     this.isProgressBarVisibile = true;
        //     this._reversePod.ConfirmInvoiceItems(formData).subscribe({
        //         next: (data) => {
        //             this.getAllReversePODData();
        //         },
        //         error: () => {
        //             this.isProgressBarVisibile = false;
        //         },
        //     });
        // } else {
        //     this.notificationSnackBarComponent.openSnackBar(
        //         "Please fill valid data for LR Details",
        //         SnackBarStatus.danger
        //     );
        // }
    }

    confirmByDC() {
        const RpodDetailsFormArray = this.reverseLogisticsItemFormGroup.get(
            "RPodItemArray"
        ) as FormArray;
        // let selectedRowValue =
        // RpodDetailsFormArray.controls[this.selectedIndex].value;
        // if (
        //     selectedRowValue["LR_DATE"] != null &&
        //     selectedRowValue["LR_DATE"] != undefined &&
        //     selectedRowValue["LR_NO"] &&
        //     selectedRowValue["DC_RECEIEVED_DATE"] != null &&
        //     selectedRowValue["DC_RECEIEVED_DATE"] != undefined
        // )  else {
        //     this.notificationSnackBarComponent.openSnackBar(
        //         "Please fill valid data for LR Details and Received date.",
        //         SnackBarStatus.danger
        //     );
        // }
    }

    isVisible() {
        if (this.currentUserRole == "Customer") {
            return (
                this.selectedReverseLogisticDetail.STATUS.toLowerCase() ==
                    "open" ||
                this.selectedReverseLogisticDetail.STATUS.toLowerCase() ==
                    "partially confirmed"
            );
        } else if (this.currentUserRole.toLowerCase() == "amararaja user") {
            return (
                this.selectedReverseLogisticDetail.STATUS.toLowerCase() ==
                    "open" ||
                this.selectedReverseLogisticDetail.STATUS.toLowerCase() ==
                    "in transit" ||
                this.selectedReverseLogisticDetail.STATUS.toLowerCase() ==
                    "partially confirmed"
            );
        } else {
            return false;
        }
    }

    viewAttachment(id: number) {
        this.isProgressBarVisibile = true;
        this._reversePodService.DownloadRPODDocument(id).subscribe({
            next: (res) => {
                this.isProgressBarVisibile = false;
                if (res) {
                    this.openAttachmentDialog(res as AttachmentResponse);
                }
            },
            error: (err) => {
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(
                    err.toString(),
                    SnackBarStatus.danger
                );
            },
        });
    }

    openAttachmentDialog(fileData: AttachmentResponse) {
        const BLOB = this._fileSaver.getBlobData(fileData);
        const attachmentDetails: AttachmentDetails = {
            FileName: fileData.FileName,
            blob: BLOB,
        };

        const DIALOG_CONFIG: MatDialogConfig = {
            data: attachmentDetails,
            panelClass: "attachment-dialog",
        };
        const DIALOG_REF = this.dialog.open(
            AttachmentDialogComponent,
            DIALOG_CONFIG
        );

        DIALOG_REF.afterClosed().subscribe({
            next: (res) => {},
            error: (err) => {},
        });
    }
}
