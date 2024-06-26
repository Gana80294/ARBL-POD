import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, CustomerGroup, Organization, Plant, PlantGroup, PlantOrganizationMap, PlantWithOrganization, SLSCustGroupData } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { InvoiceDetails, StatusTemplate, InvoiceUpdation1, ApproverDetails, FilterClass } from 'app/models/invoice-details';
import { FormGroup, FormArray, AbstractControl, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig, MatOption } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { InvoiceService } from 'app/services/invoice.service';
import { ExcelService } from 'app/services/excel.service';
import { DatePipe } from '@angular/common';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { MasterService } from 'app/services/master.service';
import { ReportService } from 'app/services/report.service';
import { fuseAnimations } from '@fuse/animations';
import { saveAs } from 'file-saver';
import { ModifyLayoutComponent } from 'app/allModules/ModifyLayout/modify-layout/modify-layout.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
@Component({
  selector: 'app-saved-invoice',
  templateUrl: './saved-invoice.component.html',
  styleUrls: ['./saved-invoice.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SavedInvoiceComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserCode: string;
  currentUserRole: string;
  MenuItems: string[];
  isProgressBarVisibile: boolean;
  allInvoicesCount: number;
  dropdownSettings: IDropdownSettings = {};
  notificationSnackBarComponent: NotificationSnackBarComponent;
  allInvoiceDetails: InvoiceDetails[] = [];
  InvoiceDetailsFormGroup: FormGroup;
  InvoiceDetailsFormArray: FormArray = this._formBuilder.array([]);
  selectedViewColumns: string[] = []
  displayedColumns: string[] = [
    // 'SELECT',
    // 'ORGANIZATION',
    // 'DIVISION',
    // 'PLANT',
    'PLANT_NAME',
    'ODIN',
    'INV_NO',
    'INV_DATE',
    'INV_TYPE',
    'INVOICE_QUANTITY',
    // 'OUTBOUND_DELIVERY',
    // 'OUTBOUND_DELIVERY_DATE',
    'CUSTOMER',
    'CUSTOMER_NAME',
    'CUSTOMER_DESTINATION',
    // 'CUSTOMER_GROUP',
    // 'CUSTOMER_GROUP_DESC',
    // 'SECTOR_DESCRIPTION',
    'FWD_AGENT',
    'LR_NO',
    'LR_DATE',
    'VEHICLE_NO',
    'CARRIER',
    'VEHICLE_CAPACITY',
    // 'EWAYBILL_NO',
    // 'EWAYBILL_DATE',
    // 'FREIGHT_ORDER',
    // 'FREIGHT_ORDER_DATE',
    'PROPOSED_DELIVERY_DATE',
    'VEHICLE_REPORTED_DATE',
    'ACTUAL_DELIVERY_DATE',
    'TRANSIT_LEAD_TIME',
    'STATUS',
    // 'Action'
  ];
  dataSource: MatTableDataSource<AbstractControl>;
  selection = new SelectionModel<InvoiceDetails>(true, []);
  @ViewChild(MatPaginator,) paginator: MatPaginator;
  @ViewChild(MatSort,) sort: MatSort;
  @ViewChild('fileInput',) fileInput: ElementRef<HTMLElement>;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  SelectedInvoiceDetail: InvoiceDetails;
  InvoiceFilterFormGroup: FormGroup;
  AllStatusTemplates: StatusTemplate[] = [];
  isDateError: boolean;
  AllCustomerGroups: CustomerGroup[] = [];
  AllOrganizations: Organization[] = [];
  AllPlants: Plant[] = [];
  AllPlantGroups: PlantGroup[] = [];
  FilteredPlants: Plant[] = [];
  AllPlantOrganizationMaps: PlantOrganizationMap[] = [];
  @ViewChild('allSelected',) private allSelected: MatOption;
  @ViewChild('allSelected1',) private allSelected1: MatOption;
  Divisions: string[] = [];
  CurrentFilterClass: FilterClass = new FilterClass();
  currentCustomPage: number;
  records: number;
  isLoadMoreVisible: boolean;
  AllSalesGroups: SLSCustGroupData[] = [];
  constructor(
    private _router: Router,
    private _dashboardService: DashboardService,
    private _masterService: MasterService,
    private _shareParameterService: ShareParameterService,
    private _invoiceService: InvoiceService,
    private _reportService: ReportService,
    private _excelService: ExcelService,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {
    this.isProgressBarVisibile = true;
    this.selectedViewColumns = this.displayedColumns
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedInvoiceDetail = new InvoiceDetails();
    this.isDateError = false;
    this.CurrentFilterClass = this._shareParameterService.GetSavedInvoiceFilterClass();
    this.currentCustomPage = 1;
    this.allInvoiceDetails = [];

    this.records = 500;
    this.isLoadMoreVisible = false;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.userID;
      this.currentUserName = this.authenticationDetails.userName;
      this.currentUserCode = this.authenticationDetails.userCode;
      this.currentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('SavedInvoice') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      else {
        console.log("SavedInvoice cannot be visible for this user");
      }
    }
    else {
      this._router.navigate(['/auth/login']);
    }
    this.InvoiceDetailsFormGroup = this._formBuilder.group({
      InvoiceDetails: this.InvoiceDetailsFormArray
    });
    if (this.CurrentFilterClass) {
      this.InvoiceFilterFormGroup = this._formBuilder.group({
        StartDate: [this.CurrentFilterClass.StartDate],
        EndDate: [this.CurrentFilterClass.EndDate],
        InvoiceNumber: [this.CurrentFilterClass.InvoiceNumber ? this.CurrentFilterClass.InvoiceNumber : ''],
        Organization: [this.CurrentFilterClass.Organization ? this.CurrentFilterClass.Organization : []],
        Division: [this.CurrentFilterClass.Division ? this.CurrentFilterClass.Division : []],
        PlantList: [this.CurrentFilterClass.PlantList ? this.CurrentFilterClass.PlantList : []],
        PlantGroupList: [this.CurrentFilterClass.PlantGroupList ? this.CurrentFilterClass.PlantGroupList : []],
        CustomerName: [this.CurrentFilterClass.CustomerName ? this.CurrentFilterClass.CustomerName : ''],
        // ,
        CustomerGroup: [this.CurrentFilterClass.CustomerGroup ? this.CurrentFilterClass.CustomerGroup : []]
      });
    }
    else {
      this.InvoiceFilterFormGroup = this._formBuilder.group({
        StartDate: [],
        EndDate: [],
        InvoiceNumber: [''],
        Organization: [[]],
        Division: [[]],
        PlantList: [[]],
        PlantGroupList: [[]],
        CustomerName: [''],
        CustomerGroup: [[]]
      });
    }
    // if (this.currentUserRole.toLowerCase() === 'amararaja user') {
    this.GetAllOrganizations();
    this.GetAllCustomerGroups();
    this.GetDivisions();
    this.GetAllPlantGroups();
    this.FilterSavedInvoices();
    // } else {
    //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
    //   this._router.navigate(['/auth/login']);
    // }


    this.dropdownSettings = {
      singleSelection: false,
      idField: 'CGID',
      textField: 'CustomerGroupCode',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
  }

  GetAllPlantGroups() {
    this._masterService.GetAllPlantGroups().subscribe({
        next: (res) => {
            this.AllPlantGroups = res as PlantGroup[];
        }
    })
}

  ResetControl(): void {
    this.SelectedInvoiceDetail = new InvoiceDetails();
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.currentCustomPage = 1;
    this.allInvoiceDetails = [];
    this.ResetInvoiceDetails();
  }

  ResetInvoiceDetails(): void {
    this.ClearFormArray(this.InvoiceDetailsFormArray);
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  // applyFilter(filterValue: string): void {
  //     this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  GetAllOrganizations(): void {
    this._masterService.GetAllOrganizationsByUserID(this.currentUserID).subscribe(
      (data) => {
        this.AllOrganizations = data as Organization[];
        this.GetAllPlants();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllCustomerGroups(): void {
    // this.isProgressBarVisibile = true;
    this._masterService.GetAllCustomerGroupsByUserID(this.authenticationDetails.userID).subscribe(
      (data) => {
        if (data) {
          this.AllCustomerGroups = data as CustomerGroup[];
          //  this.GetAllSLSGroups();
          //  this.AllCustomerGroups[0].CGID

          //  this.isProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
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
      data => {
        this.Divisions = data as string[];
        this.Divisions.forEach((div, i) => {
          if (div == '') {
            this.Divisions.splice(i, 1);
          }
        });
        // console.log("divisions",this.Divisions);
        // this.Divisions.unshift("All");
      },
      err => {
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetAllSavedInvoices(): void {
    this.isProgressBarVisibile = true;
    this._invoiceService
      .GetAllSavedInvoicesByUserID(this.currentUserID)
      .subscribe(
        data => {
          this.allInvoiceDetails = data as InvoiceDetails[];
          this.allInvoicesCount = this.allInvoiceDetails.length;
          // this.dataSource = new MatTableDataSource(
          //     this.allInvoiceDetails
          // );
          // this.dataSource.paginator = this.paginator;
          // this.dataSource.sort = this.sort;
          this.ClearFormArray(this.InvoiceDetailsFormArray);
          this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
          this.allInvoiceDetails.forEach(x => {
            this.InsertInvoiceDetailsFormGroup(x);
          });
          if (this.allInvoicesCount > 0) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
          this.isProgressBarVisibile = false;
        },
        err => {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(
            err instanceof Object ? 'Something went wrong' : err,
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
        data => {
          this.allInvoiceDetails = data as InvoiceDetails[];
          this.allInvoicesCount = this.allInvoiceDetails.length;
          // this.dataSource = new MatTableDataSource(
          //     this.allInvoiceDetails
          // );
          // this.dataSource.paginator = this.paginator;
          // this.dataSource.sort = this.sort;
          this.ClearFormArray(this.InvoiceDetailsFormArray);
          this.allInvoiceDetails.forEach(x => {
            this.InsertInvoiceDetailsFormGroup(x);
          });
          this.isProgressBarVisibile = false;
        },
        err => {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(
            err instanceof Object ? 'Something went wrong' : err,
            SnackBarStatus.danger
          );
        }
      );
  }

  InsertInvoiceDetailsFormGroup(asnItem: InvoiceDetails): void {
    const row = this._formBuilder.group({
      INV_NO: [asnItem.INV_NO],
      INV_DATE: [asnItem.INV_DATE],
      INV_TYPE: [asnItem.INV_TYPE],
      OUTBOUND_DELIVERY: [asnItem.OUTBOUND_DELIVERY],
      OUTBOUND_DELIVERY_DATE: [asnItem.OUTBOUND_DELIVERY_DATE],
      CUSTOMER: [asnItem.CUSTOMER],
      CUSTOMER_NAME: [asnItem.CUSTOMER_NAME],
      CUSTOME_GROUP: [asnItem.CUSTOMER_GROUP],
      CUSTOMER_GROUP_DESC: [asnItem.CUSTOMER_GROUP_DESC],
      SECTOR_DESCRIPTION: [asnItem.SECTOR_DESCRIPTION],
      CUSTOMER_DESTINATION: [asnItem.CUSTOMER_DESTINATION],
      PLANT_NAME: [asnItem.PLANT_NAME],
      GROSS_WEIGHT: [asnItem.GROSS_WEIGHT],
      PLANT: [asnItem.PLANT],
      ORGANIZATION: [asnItem.ORGANIZATION],
      DIVISION: [asnItem.DIVISION],
      ODIN: [asnItem.ODIN],
      VEHICLE_NO: [asnItem.VEHICLE_NO],
      VEHICLE_CAPACITY: [asnItem.VEHICLE_CAPACITY],
      FWD_AGENT: [asnItem.FWD_AGENT],
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
      INVOICE_QUANTITY: [asnItem.INVOICE_QUANTITY],
      LR_NO: [asnItem.LR_NO],
      LR_DATE: [asnItem.LR_DATE]
    });
    row.disable();
    row.get('VEHICLE_REPORTED_DATE').enable();
    this.InvoiceDetailsFormArray.push(row);
    this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
    // return row;
  }

  invoiceRowClick(index: number): void {
    const row1 = this.GetSelectedInvoiceDeatils(index);
    this._shareParameterService.SetInvoiceDetail(row1);
    this._router.navigate(['/pages/invItem']);
  }

  GetSelectedInvoiceDeatils(index: number): InvoiceDetails {
    const ivoiceDetailsFormArray = this.InvoiceDetailsFormGroup.get('InvoiceDetails') as FormArray;
    // const row1 = new InvoiceDetails();
    const invNo = ivoiceDetailsFormArray.controls[index].get('INV_NO').value;
    const row1 = this.allInvoiceDetails.filter(x => x.INV_NO === invNo)[0];
    if (row1) {
      row1.VEHICLE_REPORTED_DATE = ivoiceDetailsFormArray.controls[index].get('VEHICLE_REPORTED_DATE').value;
      return row1;
    }
    return new InvoiceDetails();
  }


  SaveAndUploadInvoiceItem(index: number): void {
    this.SelectedInvoiceDetail = this.GetSelectedInvoiceDeatils(index);
    if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== 'approved') {
      if (this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE) {
        const el: HTMLElement = this.fileInput.nativeElement;
        el.click();
        // const event = new MouseEvent('click', { bubbles: true });
        // this.renderer.invokeElementMethod(
        //   this.fileInput.nativeElement, 'dispatchEvent', [event]);
      } else {
        this.notificationSnackBarComponent.openSnackBar(
          'Please fill out Vehicle unloaded date', SnackBarStatus.danger
        );
      }
    } else {
      this.notificationSnackBarComponent.openSnackBar(
        'Invoice has already been approved', SnackBarStatus.danger
      );
    }
  }



  // isAllSelected(): boolean {
  //     if (this.selection && this.dataSource) {
  //         const numSelected = this.selection.selected.length;
  //         const numRows = this.dataSource.data.length;
  //         return numSelected === numRows;
  //     }
  //     // return true;
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle(): void {
  //     if (this.dataSource) {
  //         this.isAllSelected() ?
  //             this.selection.clear() :
  //             this.dataSource.data.forEach(row => this.selection.select(row));
  //     }
  // }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      if (Math.round(Number(evt.target.files[0].size) / (1024 * 1024)) <= 5) {
        this.fileToUpload = evt.target.files[0];
        this.fileToUploadList = [];
        this.fileToUploadList.push(this.fileToUpload);
        const Actiontype = 'Confirm';
        const Catagory = 'Invoice';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
      else {
        this.notificationSnackBarComponent.openSnackBar(
          'Please upload file size below 5 MB', SnackBarStatus.danger
        );
      }

    }
  }

  ApproveSelectedInvoices(): void {
    const Actiontype = 'Approve';
    const Catagory = 'Selected Invoice(s)';
    this.OpenConfirmationDialog(Actiontype, Catagory);

  }
  ModifyLayout(): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        TableColumns: this.displayedColumns,
        selectedColumns: this.selectedViewColumns
      },
      panelClass: 'confirmation-dialog'
    };
    let layoutRef = this.dialog.open(ModifyLayoutComponent, dialogConfig);
    layoutRef.afterClosed().subscribe((x: string[]) => {
      this.selectedViewColumns = x;
    })
  }
  isColumnHide(name: string) {
    if (this.selectedViewColumns.indexOf(name) >= 0) {
      return false;
    }
    else {
      return true;
    }
  }
  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.ConfirmInvoiceItems(Actiontype);
        }
      });
  }


  ConfirmInvoiceItems(Actiontype: string): void {
    this.isProgressBarVisibile = true;
    const invoiceUpdation = new InvoiceUpdation1();
    const VehReportedDate = this._datePipe.transform(this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE, 'yyyy-MM-dd HH:mm:ss');
    invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
    invoiceUpdation.HEADER_ID = this.SelectedInvoiceDetail.HEADER_ID;
    this._invoiceService.ConfirmInvoiceItems(invoiceUpdation).subscribe(
      data => {
        const Ststs = 'confirmed';
        if (Actiontype === 'Confirm' && this.fileToUploadList && this.fileToUploadList.length) {
          this._invoiceService.AddInvoiceAttachment(this.SelectedInvoiceDetail.HEADER_ID,
            this.currentUserID.toString(), this.fileToUploadList).subscribe(
              (dat) => {
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(`Invoice ${Ststs} successfully`, SnackBarStatus.success);
                this.ResetControl();
                this.FilterSavedInvoices();
              },
              (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.FilterSavedInvoices();
              }
            );
        } else {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar
            (`Invoice ${Ststs} successfully`, SnackBarStatus.success);
          this.ResetControl();
          this.FilterSavedInvoices();
        }
      },
      err => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(
          err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger
        );
      }
    );
  }

  SearchInvoices(): void {
    this.currentCustomPage = 1;
    this.allInvoiceDetails = [];
    this.FilterSavedInvoices();
  }
  LoadMoreData(): void {
    this.currentCustomPage = this.currentCustomPage + 1;
    this.FilterSavedInvoices();
  }
  FilterSavedInvoices(): void {
    if (this.InvoiceFilterFormGroup.valid) {
      if (!this.isDateError) {
        this.isProgressBarVisibile = true;
        const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as any[];
        const Division = this.InvoiceFilterFormGroup.get('Division').value as any[];
        let plList = this.InvoiceFilterFormGroup.get('PlantList').value as any[];
        let plGrpList = this.InvoiceFilterFormGroup.get("PlantGroupList").value as string[];
        const CustomerName = this.InvoiceFilterFormGroup.get('CustomerName').value;
        let CustomerGroup = this.InvoiceFilterFormGroup.get('CustomerGroup').value as any[];
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get('StartDate').value;
        if (staDate) {
          StartDate = this._datePipe.transform(staDate, 'yyyy-MM-dd');
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get('EndDate').value;
        if (enDate) {
          EndDate = this._datePipe.transform(enDate, 'yyyy-MM-dd');
        }
        if (!this.CurrentFilterClass) {
          this.CurrentFilterClass = new FilterClass();
        }
        this.CurrentFilterClass.StartDate = StartDate;
        this.CurrentFilterClass.EndDate = EndDate;
        this.CurrentFilterClass.Organization = Organization1.length > 0 ? Organization1 : [];
        this.CurrentFilterClass.Division = Division.length > 0 ? Division : [];
        this.CurrentFilterClass.PlantList = plList.length > 0 ? plList : [];
        this.CurrentFilterClass.PlantGroupList = (plGrpList && plGrpList.length) > 0 ? plGrpList : [];
        this.CurrentFilterClass.InvoiceNumber = InvoiceNumber;
        this.CurrentFilterClass.CustomerName = CustomerName;
        this.CurrentFilterClass.CustomerGroup = CustomerGroup.length > 0 ? CustomerGroup : [];
        this.CurrentFilterClass.UserID = this.authenticationDetails.userID;
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.CurrentFilterClass.Records = this.records;
        this._shareParameterService.SetSavedInvoiceFilterClass(this.CurrentFilterClass);
        this._invoiceService
          .FilterSavedInvoicesByUserID(this.CurrentFilterClass)
          .subscribe(
            data => {


              // this.allInvoiceDetails = data as InvoiceDetails[];
              const data1 = data as InvoiceDetails[];
              // console.log(data1);
              if (data1) {
                if (data.length < this.records) {
                  this.isLoadMoreVisible = false;
                } else {
                  this.isLoadMoreVisible = true;
                }
                data1.forEach(x => {
                  this.allInvoiceDetails.push(x);
                });
              }
              this.allInvoicesCount = this.allInvoiceDetails.length;
              // this.dataSource = new MatTableDataSource(
              //     this.allInvoiceDetails
              // );
              // this.dataSource.paginator = this.paginator;
              // this.dataSource.sort = this.sort;
              this.ClearFormArray(this.InvoiceDetailsFormArray);
              this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
              this.allInvoiceDetails.forEach(x => {
                x.SECTOR_DESCRIPTION = this.GetSectorDescription(x.CUSTOMER_GROUP_DESC);
                this.InsertInvoiceDetailsFormGroup(x);
              });
              if (this.allInvoicesCount > 0) {
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }
              this.isProgressBarVisibile = false;
            },
            err => {
              this.isProgressBarVisibile = false;
              this.notificationSnackBarComponent.openSnackBar(
                err instanceof Object ? 'Something went wrong' : err,
                SnackBarStatus.danger
              );
            }
          );
      }
    } else {
      Object.keys(this.InvoiceFilterFormGroup.controls).forEach(key => {
        this.InvoiceFilterFormGroup.get(key).markAsTouched();
        this.InvoiceFilterFormGroup.get(key).markAsDirty();
      });
    }
  }

  getFilteredPlants(): void {
    const org = this.InvoiceFilterFormGroup.get('Organization').value as string;
    if (org) {
      if (org !== 'all') {
        const plantOrgMap = this.AllPlantOrganizationMaps.filter(o => o.OrganizationCode === org);
        this.FilteredPlants = this.AllPlants.filter(o => plantOrgMap.some(y => o.PlantCode === y.PlantCode));
        const pl = this.InvoiceFilterFormGroup.get('PlantList').value as string[];
        if (pl && pl.length) {
          this.InvoiceFilterFormGroup.get('PlantList').patchValue([]);
          let pla: string[] = [];
          pl.forEach(x => {
            const index = this.FilteredPlants.findIndex(y => y.PlantCode === x);
            if (index >= 0) {
              pla.push(x);
            }
          });
          this.InvoiceFilterFormGroup.get('PlantList').patchValue(pla);
          this.togglePerOne();
        }
      } else {
        this.FilteredPlants = this.AllPlants.filter(y => y.PlantCode);
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
    if (this.InvoiceFilterFormGroup.get('PlantList').value.length) {
      if (this.InvoiceFilterFormGroup.get('PlantList').value.length === this.FilteredPlants.length) {
        this.allSelected.select();
      }
    }
  }
  toggleAllSelection(): void {
    if (this.allSelected.selected) {
      const pls = this.FilteredPlants.map(x => x.PlantCode);
      pls.push("all");
      this.InvoiceFilterFormGroup.get('PlantList').patchValue(pls);
    } else {
      this.InvoiceFilterFormGroup.get('PlantList').patchValue([]);
    }
  }

  DateSelected(): void {
    const FROMDATEVAL = this.InvoiceFilterFormGroup.get('StartDate').value as Date;
    const TODATEVAL = this.InvoiceFilterFormGroup.get('EndDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }
  onKeydown(event): boolean {
    // console.log(event.key);
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return true;
    } else {
      return false;
    }
  }

  exportAsXLSX(): void {
    if (this.InvoiceFilterFormGroup.valid) {
      if (!this.isDateError) {
        this.isProgressBarVisibile = true;
        const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as any[];
        const Division = this.InvoiceFilterFormGroup.get('Division').value as any[];
        let plList = this.InvoiceFilterFormGroup.get('PlantList').value as any[];
        const CustomerName = this.InvoiceFilterFormGroup.get('CustomerName').value;
        let CustomerGroup = this.InvoiceFilterFormGroup.get('CustomerGroup').value as any[];
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get('StartDate').value;
        if (staDate) {
          StartDate = this._datePipe.transform(staDate, 'yyyy-MM-dd');
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get('EndDate').value;
        if (enDate) {
          EndDate = this._datePipe.transform(enDate, 'yyyy-MM-dd');
        }
        if (!this.CurrentFilterClass) {
          this.CurrentFilterClass = new FilterClass();
        }
        this.CurrentFilterClass.StartDate = StartDate;
        this.CurrentFilterClass.EndDate = EndDate;
        this.CurrentFilterClass.Organization = Organization1.length > 0 ? Organization1 : [];
        this.CurrentFilterClass.Division = Division.length > 0 ? Division : [];
        this.CurrentFilterClass.PlantList = plList.length > 0 ? plList : [];
        this.CurrentFilterClass.InvoiceNumber = InvoiceNumber;
        this.CurrentFilterClass.CustomerName = CustomerName;
        this.CurrentFilterClass.CustomerGroup = CustomerGroup.length > 0 ? CustomerGroup : [];
        this.CurrentFilterClass.UserID = this.authenticationDetails.userID;
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.CurrentFilterClass.Records = this.records;
        this._shareParameterService.SetSavedInvoiceFilterClass(this.CurrentFilterClass);
        this._invoiceService
          .DownloadSavedInvoicesByUserID(this.CurrentFilterClass)
          .subscribe(
            data => {
              this.isProgressBarVisibile = false;
              const BlobFile = data as Blob;
              const currentDateTime = this._datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
              const fileName = 'Saved Invoices';
              const EXCEL_EXTENSION = '.xlsx';
              saveAs(BlobFile, fileName + '_' + currentDateTime + EXCEL_EXTENSION);
            },
            err => {
              this.isProgressBarVisibile = false;
              this.notificationSnackBarComponent.openSnackBar(
                err instanceof Object ? 'Something went wrong' : err,
                SnackBarStatus.danger
              );
            }
          );
      }
    } else {
      Object.keys(this.InvoiceFilterFormGroup.controls).forEach(key => {
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
    //   const item = {
    //     'Organization': x.ORGANIZATION,
    //     'Division': x.DIVISION,
    //     'Plant': x.PLANT,
    //     'Invoice No': x.ODIN,
    //     'Reference No': x.INV_NO,
    //     'Invoice Date': x.INV_DATE ? this._datePipe.transform(x.INV_DATE, 'dd-MM-yyyy') : '',
    //     'Invoice Type': x.INV_TYPE,
    //     'Outbound delivery': x.OUTBOUND_DELIVERY,
    //     'Outbound delivery date': x.OUTBOUND_DELIVERY_DATE ? this._datePipe.transform(x.OUTBOUND_DELIVERY_DATE, 'dd-MM-yyyy') : '',
    //     'LR Number': x.LR_NO,
    //     'LR date': x.LR_DATE ? this._datePipe.transform(x.LR_DATE, 'dd-MM-yyyy') : '',
    //     'Vehicle No': x.VEHICLE_NO,
    //     'Carrier': x.CARRIER,
    //     'Vehicle Capacity': x.VEHICLE_CAPACITY,
    //     'E-Way bill No': x.EWAYBILL_NO,
    //     'E-Way bill date': x.EWAYBILL_DATE ? this._datePipe.transform(x.EWAYBILL_DATE, 'dd-MM-yyyy') : '',
    //     'Freight order': x.FREIGHT_ORDER,
    //     'Freight order date': x.FREIGHT_ORDER_DATE ? this._datePipe.transform(x.FREIGHT_ORDER_DATE, 'dd-MM-yyyy') : '',
    //     'Proposed delivery date': x.PROPOSED_DELIVERY_DATE ? this._datePipe.transform(x.PROPOSED_DELIVERY_DATE, 'dd-MM-yyyy') : '',
    //     'Actual delivery date': x.ACTUAL_DELIVERY_DATE ? this._datePipe.transform(x.ACTUAL_DELIVERY_DATE, 'dd-MM-yyyy') : '',
    //     'Lead time': x.TRANSIT_LEAD_TIME,
    //     'Status': x.STATUS,
    //     'Vehicle reported date': x.VEHICLE_REPORTED_DATE ? this._datePipe.transform(x.ACTUAL_DELIVERY_DATE, 'dd-MM-yyyy') : '',
    //   };
    //   itemsShowedd.push(item);
    // });
    // this._excelService.exportAsExcelFile(itemsShowedd, 'invoices');
  }

  GetAllSLSGroups(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllSalesGroups().subscribe(
      (data) => {
        if (data) {
          this.AllSalesGroups = data as SLSCustGroupData[];
          // console.log("salesGroups",this.AllSalesGroups);
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
    var customerGroup = this.AllCustomerGroups.find(x => x.CustomerGroupCode == cg);
    if (customerGroup != undefined) {
      return customerGroup.Sector;
    }
    else {
      return "";
    }
  }

}
