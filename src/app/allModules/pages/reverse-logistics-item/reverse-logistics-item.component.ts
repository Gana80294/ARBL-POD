import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer, ViewChild, ViewEncapsulation } from '@angular/core';
import { a } from '@angular/core/src/render3';
import { element } from '@angular/core/src/render3/instructions';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AttachmentStatus, InvoiceDetails, InvoiceItemDetails, InvoiceUpdation, LRWithVehicleUnloaded, ReversePOD, ReversePodItemUpdation, ReversePodMaterialDetail, ReversePodUpdation } from 'app/models/invoice-details';
import { AuthenticationDetails, Reason, ChangesDetected, UserActionHistory, Itemchanges } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { DashboardService } from 'app/services/dashboard.service';
import { InvoiceService } from 'app/services/invoice.service';
import { MasterService } from 'app/services/master.service';
import { ReversePodService } from 'app/services/reverse-pod.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { Guid } from 'guid-typescript';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reverse-logistics-item',
  templateUrl: './reverse-logistics-item.component.html',
  styleUrls: ['./reverse-logistics-item.component.scss'],
  encapsulation: ViewEncapsulation.None
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
  allInvoicesCount: number;
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
  @ViewChild(MatPaginator) InvoiceItemDetailsPaginator: MatPaginator;
  @ViewChild(MatSort) InvoiceItemDetailsSort: MatSort;
  @ViewChild("reversePodFileInput") fileInput: ElementRef<HTMLElement>;
  @ViewChild("fileInput1") fileInput1: ElementRef<HTMLElement>;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  InvoiceItemFormGroup: FormGroup;
  InvoiceItemFormArray: FormArray = this._formBuilder.array([]);
  displayedColumns: string[] = [
    "MATERIAL_CODE",
    "QUANTITY",
    "HAND_OVERED_QUANTITY",
    "CUSTOMER_PENDING_QUANTITY",
    "RECEIVED_QUANTITY",
    'DC_PENDING_QUANTITY',
    'STATUS',
    'REMARKS'
  ];

  rPodMaterialDetails: ReversePodMaterialDetail[] = [];
  dataSource = new MatTableDataSource(this.rPodMaterialDetails);
  remarkOptions: any[] = ["Partially Confirmed", "Confirmed"];



  AllReasons: Reason[] = [];
  // ReasonTemplates: string[] = [];
  AttachmentId: number = 0;

  constructor(
    private _router: Router,
    private _dashboardService: DashboardService,
    private _shareParameterService: ShareParameterService,
    private _invoiceService: InvoiceService,
    private _masterService: MasterService,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _decimalPipe: DecimalPipe,
    private renderer: Renderer,
    private _reversePodService: ReversePodService
  ) {

    // if (
    //     !this.SelectedInvoiceDetail ||
    //     !this.SelectedInvoiceDetail.HEADER_ID
    // ) {
    //     this._router.navigate(["/pages/dashboard"]);
    // }
    // this.ReasonTemplates = ['Completely Received', 'Partially Received', 'Damaged'];
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

    } else {
      this._router.navigate(["/auth/login"]);
    }

    this.reverseLogisticsItemFormGroup = this._formBuilder.group({
      LR_NO: ['', [Validators.required]],
      LR_DATE: ['', [Validators.required]],
      DC_RECEIEVED_DATE: ['', [Validators.required]],
      RPodItemArray: this._formBuilder.array([])
    });

    this.selectedReverseLogisticDetail = this._shareParameterService.getReverseLogisticDetail();
    if(!this.selectedReverseLogisticDetail){
      this._router.navigate(['pages/deliverychallan']);
    }

    //get material details api call
    this.getReversePodMaterialDetails(this.selectedReverseLogisticDetail.RPOD_HEADER_ID);

    this.reverseLogisticsItemFormGroup.patchValue({
      LR_NO: this.selectedReverseLogisticDetail.LR_NO,
      LR_DATE: this.selectedReverseLogisticDetail.LR_DATE,
      DC_RECEIEVED_DATE: this.selectedReverseLogisticDetail.DC_RECEIEVED_DATE
    });


    // this.InvoiceItemFormGroup = this._formBuilder.group({
    //     VehicleReportedDate: ["", Validators.required],
    //     InvoiceItems: this.InvoiceItemFormArray,
    // });



    // this.GetAllReasons();
    // this.GetInvoiceItemDetails();
  }

  addRpodForm(materialDetail: ReversePodMaterialDetail) {
    let receivedQty1: number = 0;
    if (this.currentUserRole == 'Customer') {
      receivedQty1 = 0;
    } else {
      receivedQty1 =
        materialDetail.HAND_OVERED_QUANTITY ? materialDetail.HAND_OVERED_QUANTITY : materialDetail.QUANTITY;
    }

    let materialForm = this._formBuilder.group({
      HAND_OVERED_QUANTITY: [materialDetail.HAND_OVERED_QUANTITY ? materialDetail.HAND_OVERED_QUANTITY : materialDetail.QUANTITY,
      [Validators.required]],
      RECEIVED_QUANTITY: [receivedQty1, [Validators.required]],
      REMARKS: [materialDetail.REMARKS ? materialDetail.REMARKS : '']
    });

    if (this.currentUserRole == 'Customer') {
      materialForm.get('RECEIVED_QUANTITY').disable();
      materialForm.get('REMARKS').disable();
      this.reverseLogisticsItemFormGroup.get('DC_RECEIEVED_DATE').disable();
    }
    (this.reverseLogisticsItemFormGroup.get('RPodItemArray') as FormArray).push(materialForm);
  }

  // GetAttachmentId() {
  //     this._invoiceService
  //         .GetAttachmentID(this.SelectedInvoiceDetail.HEADER_ID)
  //         .subscribe((res) => {
  //             var result = res as AttachmentStatus;
  //             this.AttachmentId = result.AttachmentId;
  //         });
  // }

  // ResetControl(): void {
  //     this.InvoiceItemDetailsList = [];
  //     // this.SelectedInvoiceDetail = new InvoiceDetails();
  //     this.InvoiceItemFormGroup.reset();
  //     Object.keys(this.InvoiceItemFormGroup.controls).forEach((key) => {
  //         this.InvoiceItemFormGroup.get(key).markAsUntouched();
  //     });
  //     this.ResetInvoiceItems();
  //     this.fileToUpload = null;
  //     this.fileToUploadList = [];
  // }

  // ResetInvoiceItems(): void {
  //     this.ClearFormArray(this.InvoiceItemFormArray);
  //     this.dataSource = new MatTableDataSource(
  //         this.InvoiceItemFormArray.controls
  //     );
  // }
  // ClearFormArray = (formArray: FormArray) => {
  //     while (formArray.length !== 0) {
  //         formArray.removeAt(0);
  //     }
  // };

  // GetAllReasons(): void {
  //     this.isProgressBarVisibile = true;
  //     this._masterService.GetAllReasons().subscribe(
  //         (data) => {
  //             if (data) {
  //                 this.AllReasons = data as Reason[];
  //                 if (this.AllReasons && this.AllReasons.length) {
  //                     const index = this.AllReasons.findIndex(
  //                         (x) =>
  //                             x.Description.toLocaleLowerCase() ===
  //                             "completely received"
  //                     )[0];
  //                     if (index < 0) {
  //                         const res = new Reason();
  //                         res.ReasonID = 100;
  //                         res.Description = "Completely received";
  //                     }
  //                 }
  //                 this.isProgressBarVisibile = false;
  //             }
  //         },
  //         (err) => {
  //             console.error(err);
  //             this.isProgressBarVisibile = false;
  //         }
  //     );
  // }
  // GetInvoiceItemDetails(): void {
  //     if (this.currentUserRole === "Administrator") {
  //         this.GetInvoiceItemDetailsByHeaderID();
  //     }
  //     if (this.currentUserRole === "Amararaja User") {
  //         this.GetInvoiceItemDetailsByID();
  //     } else if (this.currentUserRole === "Customer") {
  //         this.GetInvoiceItemDetailsByUserAndID();
  //     }
  //     this.GetAttachmentId();
  // }
  // GetInvoiceItemDetailsByHeaderID(): void {
  //     this.isProgressBarVisibile = true;
  //     this._invoiceService
  //         .GetInvoiceItemDetailsByHeaderID(
  //             this.SelectedInvoiceDetail.HEADER_ID
  //         )
  //         .subscribe(
  //             (data) => {
  //                 this.isProgressBarVisibile = false;
  //                 this.InvoiceItemFormGroup.controls.VehicleReportedDate.patchValue(
  //                     this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE
  //                 );
  //                 this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
  //                 // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
  //                 // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
  //                 // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
  //                 //  console.log(this.InvoiceItemDetailsList);

  //                 this.InvoiceItemDetailsList.forEach((x) => {
  //                     this.SetInvoiceItemValues(x);
  //                 });
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
  // GetInvoiceItemDetailsByID(): void {
  //     this.isProgressBarVisibile = true;
  //     this._invoiceService
  //         .GetInvoiceItemDetailsByID(
  //             this.currentUserID,
  //             this.SelectedInvoiceDetail.HEADER_ID
  //         )
  //         .subscribe(
  //             (data) => {
  //                 this.isProgressBarVisibile = false;
  //                 this.InvoiceItemFormGroup.controls.VehicleReportedDate.patchValue(
  //                     this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE
  //                 );
  //                 this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
  //                 // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
  //                 // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
  //                 // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
  //                 // console.log(this.InvoiceItemDetailsList);
  //                 this.InvoiceItemDetailsList.forEach((x) => {
  //                     this.SetInvoiceItemValues(x);
  //                 });
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
  // GetInvoiceItemDetailsByUserAndID(): void {
  //     this.isProgressBarVisibile = true;
  //     this._invoiceService
  //         .GetInvoiceItemDetailsByUserAndID(
  //             this.currentUserCode,
  //             this.SelectedInvoiceDetail.HEADER_ID
  //         )
  //         .subscribe(
  //             (data) => {
  //                 this.isProgressBarVisibile = false;
  //                 this.InvoiceItemFormGroup.controls.VehicleReportedDate.patchValue(
  //                     this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE
  //                 );
  //                 this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
  //                 // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
  //                 // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
  //                 // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
  //                 // console.log(this.InvoiceItemDetailsList);
  //                 this.InvoiceItemDetailsList.forEach((x) => {
  //                     this.SetInvoiceItemValues(x);
  //                 });
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

  // SetInvoiceItemValues(invItem: InvoiceItemDetails): void {
  //     // console.log(invItem.REMARKS);

  //     let QTYVal = "0";
  //     if (invItem.QUANTITY) {
  //         QTYVal = this._decimalPipe.transform(invItem.QUANTITY, "1.2-2");
  //     }
  //     const QTYValue = parseFloat(QTYVal.replace(/,/g, ""));
  //     let REQTYVal = "0";
  //     if (invItem.RECEIVED_QUANTITY) {
  //         REQTYVal = this._decimalPipe.transform(
  //             invItem.RECEIVED_QUANTITY,
  //             "1.2-2"
  //         );
  //     }
  //     let REQTYValue = parseFloat(REQTYVal.replace(/,/g, ""));
  //     if (this.currentUserRole === "Customer") {
  //         if (
  //             !this.SelectedInvoiceDetail.STATUS.toLowerCase().includes(
  //                 "confirmed"
  //             )
  //         ) {
  //             REQTYValue = REQTYValue > 0 ? REQTYValue : QTYValue;
  //         }
  //     }
  //     var reasons = null;
  //     if (invItem.REASON != null) {
  //         reasons = invItem.REASON.split(",");
  //     } else {
  //         reasons = ["Completely received"];
  //     }
  //     let row: FormGroup;
  //     if (invItem.QUANTITY_UOM == "NOS") {
  //         row = this._formBuilder.group({
  //             ITEM_NO: [invItem.ITEM_NO],
  //             ITEM_ID: [invItem.ITEM_ID],
  //             HEADER_ID: [invItem.HEADER_ID],
  //             MATERIAL_CODE: [invItem.MATERIAL_CODE],
  //             MATERIAL_DESCRIPTION: [invItem.MATERIAL_DESCRIPTION],
  //             QUANTITY: [QTYValue],
  //             RECEIVED_QUANTITY: [
  //                 REQTYValue,
  //                 [
  //                     Validators.required,
  //                     Validators.pattern(/^[0-9]\d*$/),
  //                     Validators.min(0),
  //                     Validators.max(QTYValue),
  //                 ],
  //             ],
  //             QUANTITY_UOM: [invItem.QUANTITY_UOM],
  //             // LR_NO: [invItem.LR_NO],
  //             // LR_DATE: [invItem.LR_DATE],
  //             // FWD_AGENT: [invItem.FWD_AGENT],
  //             // CARRIER: [invItem.CARRIER], ^[0-9]\d*(\.?\d{1,2})?$
  //             // FREIGHT_ORDER: [invItem.FREIGHT_ORDER],
  //             // FREIGHT_ORDER_DATE: [invItem.FREIGHT_ORDER_DATE],
  //             STATUS: [invItem.STATUS],
  //             STATUS_DESCRIPTION: [invItem.STATUS_DESCRIPTION],
  //             REASON: [reasons],
  //             REMARKS: [invItem.REMARKS],
  //         });
  //     } else {
  //         row = this._formBuilder.group({
  //             ITEM_NO: [invItem.ITEM_NO],
  //             ITEM_ID: [invItem.ITEM_ID],
  //             HEADER_ID: [invItem.HEADER_ID],
  //             MATERIAL_CODE: [invItem.MATERIAL_CODE],
  //             MATERIAL_DESCRIPTION: [invItem.MATERIAL_DESCRIPTION],
  //             QUANTITY: [QTYValue],
  //             RECEIVED_QUANTITY: [
  //                 REQTYValue,
  //                 [
  //                     Validators.required,
  //                     Validators.pattern(/^[0-9]\d*(\.?\d{1,2})?$/),
  //                     Validators.min(0),
  //                     Validators.max(QTYValue),
  //                 ],
  //             ],
  //             QUANTITY_UOM: [invItem.QUANTITY_UOM],
  //             // LR_NO: [invItem.LR_NO],
  //             // LR_DATE: [invItem.LR_DATE],
  //             // FWD_AGENT: [invItem.FWD_AGENT],
  //             // CARRIER: [invItem.CARRIER],
  //             // FREIGHT_ORDER: [invItem.FREIGHT_ORDER],
  //             // FREIGHT_ORDER_DATE: [invItem.FREIGHT_ORDER_DATE],
  //             STATUS: [invItem.STATUS],
  //             STATUS_DESCRIPTION: [invItem.STATUS_DESCRIPTION],
  //             REASON: [reasons],
  //             REMARKS: [invItem.REMARKS],
  //         });
  //     }

  //     if (this.SelectedInvoiceDetail.STATUS.toLowerCase() == "confirmed") {
  //         row.get("RECEIVED_QUANTITY").disable();
  //         row.get("REASON").disable();
  //         row.get("REMARKS").disable();
  //     }
  //     row.get("ITEM_ID").disable();
  //     row.get("HEADER_ID").disable();
  //     row.get("MATERIAL_CODE").disable();
  //     row.get("MATERIAL_DESCRIPTION").disable();
  //     row.get("QUANTITY").disable();
  //     row.get("QUANTITY_UOM").disable();
  //     // row.get('LR_NO').disable();
  //     // row.get('LR_DATE').disable();
  //     // row.get('FWD_AGENT').disable();
  //     // row.get('CARRIER').disable();
  //     // row.get('FREIGHT_ORDER').disable();
  //     // row.get('FREIGHT_ORDER_DATE').disable();
  //     this.InvoiceItemFormArray.push(row);
  //     this.dataSource = new MatTableDataSource(
  //         this.InvoiceItemFormArray.controls
  //     );
  //     this.DynamicResonValidator(QTYValue, REQTYValue, row);
  //     // this.InvoiceItemDataSource.next(this.InvoiceItemFormArray.controls);
  // }

  // valueChanges(orderedQty: number, receivedQty: number, index: number): void {
  //     if (orderedQty && receivedQty) {
  //         const InvoiceItemsArr = this.InvoiceItemFormGroup.get(
  //             "InvoiceItems"
  //         ) as FormArray;
  //         const formGroup = InvoiceItemsArr.controls[index] as FormGroup;
  //         this.DynamicResonValidator(orderedQty, receivedQty, formGroup);
  //     }
  // }

  // DynamicResonValidator(
  //     orderedQty: number,
  //     receivedQty: number,
  //     formGroup: FormGroup
  // ): void {
  //     const REASONControl = formGroup.get("REASON") as FormControl;
  //     const REMARKSControl = formGroup.get("REMARKS") as FormControl;
  //     if (receivedQty < orderedQty) {
  //         REASONControl.enable();
  //         REMARKSControl.enable();
  //         REASONControl.setValidators(Validators.required);
  //         // REMARKSControl.setValidators(Validators.required);
  //         REMARKSControl.clearValidators();
  //     } else {
  //         if (this.currentUserRole === "Customer") {
  //             REASONControl.patchValue(["Completely received"]);
  //             //   REMARKSControl.patchValue('');
  //         }
  //         REASONControl.disable();

  //         REMARKSControl.disable();
  //         REASONControl.clearValidators();
  //         REMARKSControl.clearValidators();
  //     }
  //     REASONControl.updateValueAndValidity();
  //     REMARKSControl.updateValueAndValidity();
  // }

  // SaveAndUploadInvoiceItem(): void {
  //     if (
  //         this.SelectedInvoiceDetail.STATUS &&
  //         this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== "approved"
  //     ) {
  //         if (this.InvoiceItemFormGroup.valid) {
  //             const el: HTMLElement = this.fileInput.nativeElement;
  //             el.click();

  //             // const event = new MouseEvent('click', { bubbles: true });
  //             // this.renderer.invokeElementMethod(
  //             //   this.fileInput.nativeElement, 'dispatchEvent', [event]);
  //         } else {
  //             this.ShowValidationErrors(this.InvoiceItemFormGroup);
  //         }
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Invoice has already been approved",
  //             SnackBarStatus.danger
  //         );
  //     }
  // }

  // handleFileInput(evt): void {
  //     if (evt.target.files && evt.target.files.length > 0) {
  //         if (
  //             Math.round(Number(evt.target.files[0].size) / (1024 * 1024)) <=
  //             5
  //         ) {
  //             this.fileToUpload = evt.target.files[0];
  //             this.fileToUploadList.push(this.fileToUpload);
  //             const Actiontype = "Confirm";
  //             const Catagory = "Invoice item";
  //             this.OpenConfirmationDialog(Actiontype, Catagory);
  //         } else {
  //             this.notificationSnackBarComponent.openSnackBar(
  //                 "Please upload file size below 5 MB",
  //                 SnackBarStatus.danger
  //             );
  //         }
  //     }
  // }

  // handleFileInput1(evt): void {
  //     let VehReportedDate =
  //         this.InvoiceItemFormGroup.controls.VehicleReportedDate.value;
  //     if (VehReportedDate) {
  //         VehReportedDate = this._datePipe.transform(
  //             VehReportedDate,
  //             "yyyy-MM-dd HH:mm:ss"
  //         );
  //     }
  //     if (
  //         VehReportedDate != null &&
  //         VehReportedDate != "" &&
  //         !VehReportedDate.toString().includes("1970")
  //     ) {
  //         if (evt.target.files && evt.target.files.length > 0) {
  //             if (
  //                 Math.round(
  //                     Number(evt.target.files[0].size) / (1024 * 1024)
  //                 ) <= 5
  //             ) {
  //                 this.fileToUpload = evt.target.files[0];
  //                 this.fileToUploadList.push(this.fileToUpload);
  //                 const Changes = new ChangesDetected();
  //                 Changes.Status = this.SelectedInvoiceDetail.STATUS
  //                     ? "Current Status is " +
  //                       this.SelectedInvoiceDetail.STATUS
  //                     : "";
  //                 Changes.DocumentReUpload = this.fileToUpload.name;
  //                 const ActionLog = new UserActionHistory();
  //                 ActionLog.Action = "Web";
  //                 ActionLog.ChangesDetected = JSON.stringify(Changes);
  //                 ActionLog.DateTime = new Date();
  //                 ActionLog.IpAddress = this.authenticationDetails.ipAddress
  //                     ? this.authenticationDetails.ipAddress
  //                     : "";
  //                 ActionLog.Location = this.authenticationDetails.geoLocation
  //                     ? this.authenticationDetails.geoLocation
  //                     : "";
  //                 ActionLog.TransID = this.SelectedInvoiceDetail.HEADER_ID;
  //                 ActionLog.UserName = this.authenticationDetails.userName;
  //                 this.isProgressBarVisibile = true;
  //                 this._invoiceService
  //                     .AddInvoiceAttachment(
  //                         this.SelectedInvoiceDetail.HEADER_ID,
  //                         this.currentUserID.toString(),
  //                         this.fileToUploadList
  //                     )
  //                     .subscribe({
  //                         next: (res) => {
  //                             this._invoiceService
  //                                 .CreateUserActionHistory(ActionLog)
  //                                 .subscribe({
  //                                     next: (res) => {
  //                                         this.isProgressBarVisibile = false;
  //                                         this.notificationSnackBarComponent.openSnackBar(
  //                                             `Document Uploaded successfully`,
  //                                             SnackBarStatus.success
  //                                         );
  //                                         this._router.navigate(["pages/dashboard"]);
  //                                     },
  //                                     error: (err) => {
  //                                         this.isProgressBarVisibile = false;
  //                                         this.notificationSnackBarComponent.openSnackBar(
  //                                             err instanceof Object
  //                                                 ? "Something went wrong"
  //                                                 : err,
  //                                             SnackBarStatus.danger
  //                                         );
  //                                     },
  //                                 });
  //                         },
  //                         error: (err) => {
  //                             this.isProgressBarVisibile = false;
  //                             this.notificationSnackBarComponent.openSnackBar(
  //                                 err instanceof Object
  //                                     ? "Something went wrong"
  //                                     : err,
  //                                 SnackBarStatus.danger
  //                             );
  //                         },
  //                     });
  //             } else {
  //                 this.notificationSnackBarComponent.openSnackBar(
  //                     "Please upload file size below 5 MB",
  //                     SnackBarStatus.danger
  //                 );
  //             }
  //         }
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Please fill valid vehicle unloaded date.",
  //             SnackBarStatus.danger
  //         );
  //     }
  // }

  // SaveInvoiceItem(): void {
  //     if (
  //         this.SelectedInvoiceDetail.STATUS &&
  //         this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== "approved"
  //     ) {
  //         if (
  //             this.SelectedInvoiceDetail.STATUS &&
  //             !this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase().includes(
  //                 "confirmed"
  //             )
  //         ) {
  //             if (this.InvoiceItemFormGroup.valid) {
  //                 const Actiontype = "Save";
  //                 const Catagory = "Invoice item";
  //                 this.OpenConfirmationDialog(Actiontype, Catagory);
  //             } else {
  //                 this.ShowValidationErrors(this.InvoiceItemFormGroup);
  //             }
  //         } else {
  //             this.notificationSnackBarComponent.openSnackBar(
  //                 "Invoice has already been confirmed",
  //                 SnackBarStatus.danger
  //             );
  //         }
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Invoice has already been approved ",
  //             SnackBarStatus.danger
  //         );
  //     }
  // }

  // UpdateInvoiceStatus(): void {
  //     if (
  //         this.SelectedInvoiceDetail.STATUS &&
  //         this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() ===
  //             "partiallyconfirmed"
  //     ) {
  //         // console.log(this.InvoiceItemFormGroup.valid);

  //         if (
  //             this.InvoiceItemFormGroup.valid ||
  //             this.currentUserRole === "Administrator" ||
  //             this.currentUserRole.toLocaleLowerCase().includes("coordinator")
  //         ) {
  //             const Actiontype = "Change";
  //             const Catagory = "Status to save";
  //             this.OpenConfirmationDialog(Actiontype, Catagory);
  //         } else {
  //             this.ShowValidationErrors(this.InvoiceItemFormGroup);
  //         }
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Invoice has to Partially Confirmed to update the status to save",
  //             SnackBarStatus.danger
  //         );
  //     }
  // }

  // ApproveInvoiceItem(): void {
  //     if (
  //         this.SelectedInvoiceDetail.STATUS &&
  //         this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== "approved"
  //     ) {
  //         if (
  //             this.SelectedInvoiceDetail.STATUS &&
  //             this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() ===
  //                 "confirmed"
  //         ) {
  //             if (this.InvoiceItemFormGroup.valid) {
  //                 const Actiontype = "Approve";
  //                 const Catagory = "Invoice item";
  //                 this.OpenConfirmationDialog(Actiontype, Catagory);
  //             } else {
  //                 this.ShowValidationErrors(this.InvoiceItemFormGroup);
  //             }
  //         } else {
  //             this.notificationSnackBarComponent.openSnackBar(
  //                 "POD Document not yet uploaded by customer",
  //                 SnackBarStatus.danger
  //             );
  //         }
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Invoice has already been approved ",
  //             SnackBarStatus.danger
  //         );
  //     }
  // }

  // ShowValidationErrors(formGroup: FormGroup): void {
  //     Object.keys(formGroup.controls).forEach((key) => {
  //         if (!formGroup.get(key).valid) {
  //             console.log(key);
  //         }
  //         formGroup.get(key).markAsTouched();
  //         formGroup.get(key).markAsDirty();
  //         if (formGroup.get(key) instanceof FormArray) {
  //             const FormArrayControls = formGroup.get(key) as FormArray;
  //             Object.keys(FormArrayControls.controls).forEach((key1) => {
  //                 if (FormArrayControls.get(key1) instanceof FormGroup) {
  //                     const FormGroupControls = FormArrayControls.get(
  //                         key1
  //                     ) as FormGroup;
  //                     Object.keys(FormGroupControls.controls).forEach(
  //                         (key2) => {
  //                             FormGroupControls.get(key2).markAsTouched();
  //                             FormGroupControls.get(key2).markAsDirty();
  //                             if (!FormGroupControls.get(key2).valid) {
  //                                 console.log(key2);
  //                             }
  //                         }
  //                     );
  //                 } else {
  //                     FormArrayControls.get(key1).markAsTouched();
  //                     FormArrayControls.get(key1).markAsDirty();
  //                 }
  //             });
  //         }
  //     });
  // }

  // OpenConfirmationDialog(
  //     Actiontype: string,
  //     Catagory: string,
  //     IsWithoutDoc = false
  // ): void {
  //     const dialogConfig: MatDialogConfig = {
  //         data: {
  //             Actiontype: Actiontype,
  //             Catagory: Catagory,
  //         },
  //         panelClass: "confirmation-dialog",
  //     };
  //     const dialogRef = this.dialog.open(
  //         NotificationDialogComponent,
  //         dialogConfig
  //     );
  //     dialogRef.afterClosed().subscribe((result) => {
  //         if (result) {
  //             if (IsWithoutDoc) {
  //                 this.ConfirmInvoiceItems();
  //             } else if (Actiontype === "Change") {
  //                 this.UpdatePartiallyConfirmedInvoiceStatus();
  //             } else {
  //                 this.UpdateInvoiceItems(Actiontype);
  //             }
  //         }
  //     });
  // }

  // UpdatePartiallyConfirmedInvoiceStatus(): void {
  //     const Changes = new ChangesDetected();
  //     Changes.Status = this.SelectedInvoiceDetail.STATUS + " to Saved";
  //     const ActionLog = new UserActionHistory();
  //     ActionLog.Action = "Web";
  //     ActionLog.ChangesDetected = JSON.stringify(Changes);
  //     ActionLog.DateTime = new Date();
  //     ActionLog.IpAddress = this.authenticationDetails.ipAddress
  //         ? this.authenticationDetails.ipAddress
  //         : "";
  //     ActionLog.Location = this.authenticationDetails.geoLocation
  //         ? this.authenticationDetails.geoLocation
  //         : "";
  //     ActionLog.TransID = this.SelectedInvoiceDetail.HEADER_ID;
  //     ActionLog.UserName = this.authenticationDetails.userName;
  //     this.isProgressBarVisibile = true;
  //     this._invoiceService
  //         .UpdatePartiallyConfirmedInvoiceStatus(
  //             this.SelectedInvoiceDetail.HEADER_ID,
  //             "Saved",
  //             this.currentUserID.toString()
  //         )
  //         .subscribe(
  //             (dat) => {
  //                 this._invoiceService
  //                     .CreateUserActionHistory(ActionLog)
  //                     .subscribe(() => {});
  //                 this.isProgressBarVisibile = false;
  //                 this.notificationSnackBarComponent.openSnackBar(
  //                     `Invoice status changed to save`,
  //                     SnackBarStatus.success
  //                 );
  //                 this.ResetControl();
  //                 // this.GetInvoiceItemDetails();
  //                 this._router.navigate(["/pages/partialinvoice"]);
  //             },
  //             (err) => {
  //                 console.error(err);
  //                 this.isProgressBarVisibile = false;
  //                 this.notificationSnackBarComponent.openSnackBar(
  //                     err instanceof Object ? "Something went wrong" : err,
  //                     SnackBarStatus.danger
  //                 );
  //             }
  //         );
  // }

  // GetInvoiceItemValues(Actiontype: string): InvoiceItemDetails[] {
  //     const InvoiceItemsArr = this.InvoiceItemFormGroup.get(
  //         "InvoiceItems"
  //     ) as FormArray;
  //     InvoiceItemsArr.controls.forEach((x) => {
  //         const ItemID = x.get("ITEM_ID").value;
  //         const SelectedRFQItem = this.InvoiceItemDetailsList.filter(
  //             (y) => y.ITEM_ID === ItemID
  //         )[0];
  //         SelectedRFQItem.RECEIVED_QUANTITY =
  //             x.get("RECEIVED_QUANTITY").value;
  //         var reasons = "";
  //         var selectedReasons = x.get("REASON").value;
  //         // console.log("selectedReasons", selectedReasons);
  //         if (selectedReasons != null) {
  //             selectedReasons.forEach((reason, i) => {
  //                 if (i < selectedReasons.length - 1) {
  //                     reasons += reason + ",";
  //                 } else {
  //                     reasons += reason;
  //                 }
  //             });
  //         } else {
  //             reasons = null;
  //         }
  //         // console.log("reasons", reasons);
  //         SelectedRFQItem.REASON = reasons;
  //         SelectedRFQItem.REMARKS = x.get("REMARKS").value;
  //         SelectedRFQItem.STATUS =
  //             Actiontype === "Save"
  //                 ? "Saved"
  //                 : Actiontype === "Approve"
  //                 ? "Approved"
  //                 : Actiontype === "Confirm"
  //                 ? "confirmed"
  //                 : "";
  //     });
  //     return this.InvoiceItemDetailsList;
  // }

  // UpdateInvoiceItems(Actiontype: string): void {
  //     this.isProgressBarVisibile = true;
  //     let Ststs = "";
  //     const invoiceUpdation = new InvoiceUpdation();
  //     let VehReportedDate =
  //         this.InvoiceItemFormGroup.controls.VehicleReportedDate.value;
  //     if (VehReportedDate) {
  //         VehReportedDate = this._datePipe.transform(
  //             VehReportedDate,
  //             "yyyy-MM-dd HH:mm:ss"
  //         );
  //     }
  //     invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
  //     invoiceUpdation.InvoiceItems = this.GetInvoiceItemValues(Actiontype);
  //     if (
  //         invoiceUpdation.VEHICLE_REPORTED_DATE != null &&
  //         !invoiceUpdation.VEHICLE_REPORTED_DATE.includes("1970")
  //     ) {
  //         if (
  //             Actiontype === "Confirm" &&
  //             this.fileToUploadList &&
  //             this.fileToUploadList.length
  //         ) {
  //             this._invoiceService
  //                 .AddInvoiceAttachment(
  //                     this.SelectedInvoiceDetail.HEADER_ID,
  //                     this.currentUserID.toString(),
  //                     this.fileToUploadList
  //                 )
  //                 .subscribe({
  //                     next: (res) => {
  //                         var payload = new LRWithVehicleUnloaded();
  //                         payload.LRNumber = this.SelectedInvoiceDetail.LR_NO;
  //                         payload.VehicleUnloadedDate = VehReportedDate;
  //                         payload.Customer =
  //                             this.SelectedInvoiceDetail.CUSTOMER;
  //                         payload.LRDate =
  //                             typeof this.SelectedInvoiceDetail.LR_DATE ==
  //                             "string"
  //                                 ? new Date(
  //                                       this.SelectedInvoiceDetail.LR_DATE
  //                                   )
  //                                 : this.SelectedInvoiceDetail.LR_DATE;
  //                         forkJoin([
  //                             this._invoiceService.UpdateInvoiceItems(
  //                                 invoiceUpdation
  //                             ),
  //                             this._invoiceService.UpdateVehicleUnloadedDateByLR(
  //                                 payload
  //                             ),
  //                         ]).subscribe({
  //                             next: (res) => {
  //                                 const InvDetail = res[0] as InvoiceDetails;
  //                                 if (InvDetail) {
  //                                     Ststs = InvDetail.STATUS;
  //                                 } else {
  //                                     Ststs = "Confirmed";
  //                                 }
  //                                 this.isProgressBarVisibile = false;
  //                                 this.notificationSnackBarComponent.openSnackBar(
  //                                     `Invoice item ${Ststs} successfully`,
  //                                     SnackBarStatus.success
  //                                 );
  //                                 this.ResetControl();
  //                                 this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE =
  //                                     new Date(VehReportedDate);
  //                                 this.SelectedInvoiceDetail.STATUS = Ststs;
  //                                 this.GetInvoiceItemDetails();
  //                             },
  //                             error: (err) => {
  //                                 this.isProgressBarVisibile = false;
  //                                 this.notificationSnackBarComponent.openSnackBar(
  //                                     err instanceof Object
  //                                         ? "Something went wrong"
  //                                         : err,
  //                                     SnackBarStatus.danger
  //                                 );
  //                             },
  //                         });
  //                     },
  //                 });
  //         } else {
  //             this._invoiceService
  //                 .UpdateInvoiceItems(invoiceUpdation)
  //                 .subscribe({
  //                     next: (res) => {
  //                         const InvDetail = res[0] as InvoiceDetails;
  //                         if (InvDetail) {
  //                             Ststs = InvDetail.STATUS;
  //                         } else {
  //                             Ststs =
  //                                 Actiontype === "Save"
  //                                     ? "Saved"
  //                                     : Actiontype === "Approve"
  //                                     ? "Approved"
  //                                     : Actiontype === "Confirm"
  //                                     ? "confirmed"
  //                                     : "";
  //                         }
  //                         this.isProgressBarVisibile = false;
  //                         this.notificationSnackBarComponent.openSnackBar(
  //                             `Invoice item ${Ststs} successfully`,
  //                             SnackBarStatus.success
  //                         );
  //                         this.ResetControl();
  //                         this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE =
  //                             new Date(VehReportedDate);
  //                         this.SelectedInvoiceDetail.STATUS = Ststs;
  //                         this.GetInvoiceItemDetails();
  //                     },
  //                     error: (err: any) => {
  //                         this.isProgressBarVisibile = false;
  //                         this.notificationSnackBarComponent.openSnackBar(
  //                             err instanceof Object
  //                                 ? "Something went wrong"
  //                                 : err,
  //                             SnackBarStatus.danger
  //                         );
  //                     },
  //                 });
  //         }
  //         // this._invoiceService
  //         //     .UpdateInvoiceItems(invoiceUpdation)
  //         //     .subscribe(
  //         //         (data) => {
  //         //             const InvDetail = data as InvoiceDetails;
  //         //             if (InvDetail) {
  //         //                 Ststs = InvDetail.STATUS;
  //         //             } else {
  //         //                 Ststs =
  //         //                     Actiontype === "Save"
  //         //                         ? "Saved"
  //         //                         : Actiontype === "Approve"
  //         //                         ? "Approved"
  //         //                         : Actiontype === "Confirm"
  //         //                         ? "confirmed"
  //         //                         : "";
  //         //             }
  //         //             if (
  //         //                 Actiontype === "Confirm" &&
  //         //                 this.fileToUploadList &&
  //         //                 this.fileToUploadList.length
  //         //             ) {
  //         //                 this._invoiceService
  //         //                     .AddInvoiceAttachment(
  //         //                         this.SelectedInvoiceDetail.HEADER_ID,
  //         //                         this.currentUserID.toString(),
  //         //                         this.fileToUploadList
  //         //                     )
  //         //                     .subscribe(
  //         //                         (dat) => {
  //         //                             var payload =
  //         //                                 new LRWithVehicleUnloaded();
  //         //                             payload.LRNumber =
  //         //                                 this.SelectedInvoiceDetail.LR_NO;
  //         //                             payload.VehicleUnloadedDate =
  //         //                                 VehReportedDate;
  //         //                             payload.Customer =
  //         //                                 this.SelectedInvoiceDetail.CUSTOMER;
  //         //                             payload.LRDate =
  //         //                                 typeof this
  //         //                                     .SelectedInvoiceDetail
  //         //                                     .LR_DATE == "string"
  //         //                                     ? new Date(
  //         //                                           this.SelectedInvoiceDetail.LR_DATE
  //         //                                       )
  //         //                                     : this.SelectedInvoiceDetail
  //         //                                           .LR_DATE;
  //         //                             this._invoiceService
  //         //                                 .UpdateVehicleUnloadedDateByLR(
  //         //                                     payload
  //         //                                 )
  //         //                                 .subscribe(
  //         //                                     () => {
  //         //                                         this.isProgressBarVisibile =
  //         //                                             false;
  //         //                                         this.notificationSnackBarComponent.openSnackBar(
  //         //                                             `Invoice item ${Ststs} successfully`,
  //         //                                             SnackBarStatus.success
  //         //                                         );
  //         //                                         this.ResetControl();
  //         //                                         this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE =
  //         //                                             new Date(
  //         //                                                 VehReportedDate
  //         //                                             );
  //         //                                         this.SelectedInvoiceDetail.STATUS =
  //         //                                             Ststs;
  //         //                                         this.GetInvoiceItemDetails();
  //         //                                     },
  //         //                                     (err) => {
  //         //                                         this.isProgressBarVisibile =
  //         //                                             false;
  //         //                                         this.notificationSnackBarComponent.openSnackBar(
  //         //                                             err instanceof
  //         //                                                 Object
  //         //                                                 ? "Something went wrong"
  //         //                                                 : err,
  //         //                                             SnackBarStatus.danger
  //         //                                         );
  //         //                                     }
  //         //                                 );
  //         //                         },
  //         //                         (err) => {
  //         //                             this.isProgressBarVisibile = false;
  //         //                             this.notificationSnackBarComponent.openSnackBar(
  //         //                                 err instanceof Object
  //         //                                     ? "Something went wrong"
  //         //                                     : err,
  //         //                                 SnackBarStatus.danger
  //         //                             );
  //         //                         }
  //         //                     );
  //         //             } else {
  //         //                 this.isProgressBarVisibile = false;
  //         //                 this.notificationSnackBarComponent.openSnackBar(
  //         //                     `Invoice item ${Ststs} successfully`,
  //         //                     SnackBarStatus.success
  //         //                 );
  //         //                 this.ResetControl();
  //         //                 this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE =
  //         //                     new Date(VehReportedDate);
  //         //                 this.SelectedInvoiceDetail.STATUS = Ststs;
  //         //                 this.GetInvoiceItemDetails();
  //         //             }
  //         //             const Changes = new ChangesDetected();
  //         //             Changes.Status =
  //         //                 this.SelectedInvoiceDetail.STATUS +
  //         //                 " to " +
  //         //                 Ststs;
  //         //             Changes.UnloadedDate =
  //         //                 invoiceUpdation.VEHICLE_REPORTED_DATE;
  //         //             Changes.DocumentUpload = this.fileToUpload.name;
  //         //             var temp = [];
  //         //             invoiceUpdation.InvoiceItems.forEach((ele) => {
  //         //                 const itemchnges = new Itemchanges();
  //         //                 itemchnges.ID = ele.ITEM_ID;
  //         //                 itemchnges.Item = ele.ITEM_NO;
  //         //                 itemchnges.Quantity = ele.QUANTITY;
  //         //                 itemchnges.ReceivedQty = ele.RECEIVED_QUANTITY;
  //         //                 itemchnges.Remarks = ele.REMARKS;
  //         //                 temp.push(itemchnges);
  //         //             });
  //         //             Changes.Item = temp;
  //         //             const ActionLog = new UserActionHistory();
  //         //             ActionLog.Action = "Web";
  //         //             ActionLog.ChangesDetected = JSON.stringify(Changes);
  //         //             ActionLog.DateTime = new Date();
  //         //             ActionLog.IpAddress = this.authenticationDetails
  //         //                 .ipAddress
  //         //                 ? this.authenticationDetails.ipAddress
  //         //                 : "";
  //         //             ActionLog.Location = this.authenticationDetails
  //         //                 .geoLocation
  //         //                 ? this.authenticationDetails.geoLocation
  //         //                 : "";
  //         //             ActionLog.TransID = InvDetail.HEADER_ID;
  //         //             ActionLog.UserName =
  //         //                 this.authenticationDetails.userName;
  //         //             this._invoiceService
  //         //                 .CreateUserActionHistory(ActionLog)
  //         //                 .subscribe((data) => {});
  //         //         },
  //         //         (err) => {
  //         //             this.isProgressBarVisibile = false;
  //         //             this.notificationSnackBarComponent.openSnackBar(
  //         //                 err instanceof Object
  //         //                     ? "Something went wrong"
  //         //                     : err,
  //         //                 SnackBarStatus.danger
  //         //             );
  //         //         }
  //         //     );
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Please fill valid vehicle unloaded date.",
  //             SnackBarStatus.danger
  //         );
  //         this.isProgressBarVisibile = false;
  //     }
  // }

  // ConfirmWithoutAttachment() {
  //     var Actiontype = "Confirm";
  //     this.OpenConfirmationDialog(Actiontype, "Invoice Item", true);
  // }

  // ConfirmInvoiceItems() {
  //     var Actiontype = "Confirm";
  //     this.isProgressBarVisibile = true;
  //     let Ststs = "";
  //     const invoiceUpdation = new InvoiceUpdation();
  //     let VehReportedDate =
  //         this.InvoiceItemFormGroup.controls.VehicleReportedDate.value;
  //     if (VehReportedDate) {
  //         VehReportedDate = this._datePipe.transform(
  //             VehReportedDate,
  //             "yyyy-MM-dd HH:mm:ss"
  //         );
  //     }
  //     invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
  //     invoiceUpdation.InvoiceItems = this.GetInvoiceItemValues(Actiontype);
  //     if (
  //         invoiceUpdation.VEHICLE_REPORTED_DATE != null &&
  //         !invoiceUpdation.VEHICLE_REPORTED_DATE.includes("1970")
  //     ) {
  //         this._invoiceService.UpdateInvoiceItems(invoiceUpdation).subscribe(
  //             (data) => {
  //                 const InvDetail = data as InvoiceDetails;
  //                 if (InvDetail) {
  //                     Ststs = InvDetail.STATUS;
  //                 } else {
  //                     Ststs =
  //                         Actiontype === "Save"
  //                             ? "Saved"
  //                             : Actiontype === "Approve"
  //                             ? "Approved"
  //                             : Actiontype === "Confirm"
  //                             ? "confirmed"
  //                             : "";
  //                 }
  //                 this.isProgressBarVisibile = false;
  //                 this.notificationSnackBarComponent.openSnackBar(
  //                     `Invoice item ${Ststs} successfully`,
  //                     SnackBarStatus.success
  //                 );
  //                 this.ResetControl();
  //                 this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE = new Date(
  //                     VehReportedDate
  //                 );
  //                 this.SelectedInvoiceDetail.STATUS = Ststs;
  //                 this.GetInvoiceItemDetails();
  //                 const Changes = new ChangesDetected();
  //                 Changes.Status =
  //                     this.SelectedInvoiceDetail.STATUS + " to " + Ststs;
  //                 Changes.UnloadedDate =
  //                     invoiceUpdation.VEHICLE_REPORTED_DATE;
  //                 var temp = [];
  //                 invoiceUpdation.InvoiceItems.forEach((ele) => {
  //                     const itemchnges = new Itemchanges();
  //                     itemchnges.ID = ele.ITEM_ID;
  //                     itemchnges.Item = ele.ITEM_NO;
  //                     itemchnges.Quantity = ele.QUANTITY;
  //                     itemchnges.ReceivedQty = ele.RECEIVED_QUANTITY;
  //                     itemchnges.Remarks = ele.REMARKS;
  //                     temp.push(itemchnges);
  //                 });
  //                 Changes.Item = temp;
  //                 const ActionLog = new UserActionHistory();
  //                 ActionLog.Action = "Web";
  //                 ActionLog.ChangesDetected = JSON.stringify(Changes);
  //                 ActionLog.DateTime = new Date();
  //                 ActionLog.IpAddress = this.authenticationDetails.ipAddress
  //                     ? this.authenticationDetails.ipAddress
  //                     : "";
  //                 ActionLog.Location = this.authenticationDetails.geoLocation
  //                     ? this.authenticationDetails.geoLocation
  //                     : "";
  //                 ActionLog.TransID = InvDetail.HEADER_ID;
  //                 ActionLog.UserName = this.authenticationDetails.userName;
  //                 this._invoiceService
  //                     .CreateUserActionHistory(ActionLog)
  //                     .subscribe((data) => {});
  //             },
  //             (err) => {
  //                 this.isProgressBarVisibile = false;
  //                 this.notificationSnackBarComponent.openSnackBar(
  //                     err instanceof Object ? "Something went wrong" : err,
  //                     SnackBarStatus.danger
  //                 );
  //             }
  //         );
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar(
  //             "Please fill valid vehicle unloaded date.",
  //             SnackBarStatus.danger
  //         );
  //         this.isProgressBarVisibile = false;
  //     }
  // }

  // ReUploadAttachment() {
  //     const el: HTMLElement = this.fileInput1.nativeElement;
  //     el.click();
  // }

  // applyFilter(filterValue: string): void {
  //     this.InvoiceItemDetailsDataSource.filter = filterValue
  //         .trim()
  //         .toLowerCase();
  // }

  // onKeydown(event): boolean {
  //     // console.log(event.key);
  //     if (event.key === "Backspace" || event.key === "Delete") {
  //         return true;
  //     } else {
  //         return false;
  //     }
  // }

  getReversePodMaterialDetails(headerID: number) {
    this._dashboardService.getReversePodMaterialDetails(headerID).subscribe((res) => {
      if (res) {
        this.rPodMaterialDetails = res as ReversePodMaterialDetail[];
        this.rPodMaterialDetails.forEach(element => {
          element.STATUS = element.STATUS == 'Open' ? 'Confirmed' : element.STATUS;
          this.addRpodForm(element);
        });
        this.dataSource = new MatTableDataSource(this.rPodMaterialDetails);
      }
    },
      (err) => {

      }
    );
  }

  handOveredQtyValidation(event, actualQty: number, index: number) {
    let handOveredQty = event.target.value

    if (handOveredQty == actualQty) {
      this.dataSource.data[index].STATUS = 'Confirmed';
    } else if (handOveredQty < actualQty) {
      this.dataSource.data[index].STATUS = 'Partially Confirmed';
    }
    this.dataSource._updateChangeSubscription();
  }
  receivedQtyValidation(event, hqty: number, actualQty: number, index: number) {
    let receivedQty = event.target.value

    if (receivedQty == hqty && hqty == actualQty) {
      this.dataSource.data[index].STATUS = 'Confirmed';
    }
    if (receivedQty < hqty || hqty < actualQty) {
      this.dataSource.data[index].STATUS = 'Partially Confirmed';
    }
    this.dataSource._updateChangeSubscription();
  }

  confirmReversePOD() {
    if (this.reverseLogisticsItemFormGroup.valid && this.isValidForm()) {
      const el: HTMLElement = this.fileInput.nativeElement;
      el.click();
    }
    else {
      this.ShowValidationErrors(this.reverseLogisticsItemFormGroup);
    }
  }

  isFormValid: boolean = true;
  isValidForm() {
    let rPOdFormArray = (this.reverseLogisticsItemFormGroup.get('RPodItemArray') as FormArray).controls;

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
      if (this.dataSource.data[i].QUANTITY < rPOdFormArray[i].value.HAND_OVERED_QUANTITY) {
        return false;
      }
      else if (rPOdFormArray[i].value.HAND_OVERED_QUANTITY < 0) {
        return false;
      }
      else if (this.currentUserRole != 'Customer' && (rPOdFormArray[i].value.HAND_OVERED_QUANTITY < rPOdFormArray[i].value.RECEIVED_QUANTITY)) {
        return false;
      }
      else if (rPOdFormArray[i].value.RECEIVED_QUANTITY < 0) {
        return false;
      }
      else {
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
    payLoad.LR_NO = this.reverseLogisticsItemFormGroup.value['LR_NO'];
    payLoad.LR_DATE = this.reverseLogisticsItemFormGroup.value['LR_DATE'];
    payLoad.DC_RECEIEVED_DATE = this.reverseLogisticsItemFormGroup.get('DC_RECEIEVED_DATE').value;
    payLoad.LR_DATE = this._datePipe.transform(
      payLoad.LR_DATE,
      "yyyy-MM-dd HH:mm:ss"
    );
    payLoad.DC_RECEIEVED_DATE = this._datePipe.transform(
      payLoad.DC_RECEIEVED_DATE,
      "yyyy-MM-dd HH:mm:ss"
    );
    payLoad.Status = this.currentUserRole == 'Customer' ? 1 : 2;
    payLoad.DC_ACKNOWLEDGEMENT_DATE = this.selectedReverseLogisticDetail.DC_ACKNOWLEDGEMENT_DATE;
    payLoad.STATUS =
      this.selectedReverseLogisticDetail.STATUS;
    payLoad.STATUS = this.currentUserRole == 'Customer' ? 'In Transit' :
      this.dataSource.data.some(x => x.STATUS.toLowerCase().includes('partially confirmed')) ?
        'Partially Confirmed' : 'Confirmed';

    const RPODFORMARRAY = this.reverseLogisticsItemFormGroup.get(
      "RPodItemArray"
    ) as FormArray;
    payLoad.MATERIALS = [];
    this.dataSource.data.forEach((element, i) => {
      let rpodItem = new ReversePodItemUpdation();
      rpodItem = RPODFORMARRAY.controls[i].value;
      rpodItem.RECEIVED_QUANTITY = RPODFORMARRAY.controls[i].get('RECEIVED_QUANTITY').value;
      rpodItem.REMARKS = RPODFORMARRAY.controls[i].get('REMARKS').value;
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
        this._router.navigate(['pages/deliverychallan']);
      },
      error: (err) => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(
          err,
          SnackBarStatus.danger
        );
      }
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
}
