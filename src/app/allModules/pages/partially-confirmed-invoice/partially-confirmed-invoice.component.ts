import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, CustomerGroup, Organization, Plant, PlantOrganizationMap, PlantWithOrganization, SLSCustGroupData, SLSGroup, SLSGroupData, UserActionHistory } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { MatOption, MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FilterClass, InvoiceDetails, StatusTemplate } from 'app/models/invoice-details';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from 'app/services/invoice.service';
import { ReportService } from 'app/services/report.service';
import { MasterService } from 'app/services/master.service';
import { ExcelService } from 'app/services/excel.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { DatePipe } from '@angular/common';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { saveAs } from 'file-saver';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { ModifyLayoutComponent } from 'app/allModules/ModifyLayout/modify-layout/modify-layout.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-partially-confirmed-invoice',
  templateUrl: './partially-confirmed-invoice.component.html',
  styleUrls: ['./partially-confirmed-invoice.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PartiallyConfirmedInvoiceComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  MenuItems: string[];
  isProgressBarVisibile: boolean;
  AllOrganizations: Organization[] = [];
  AllPlants: Plant[] = [];
  AllCustomerGroups: CustomerGroup[] = [];
  FilteredPlants: Plant[] = [];
  AllPlantOrganizationMaps: PlantOrganizationMap[] = [];
  @ViewChild('allSelected',) private allSelected: MatOption;
  @ViewChild('allSelected1',) private allSelected1: MatOption;
  Divisions: string[] = [];
  allInvoicesCount: number;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  FilteredInvoiceDetails: InvoiceDetails[] = [];
  dropdownSettings: IDropdownSettings = {};
  selectedViewColumns: string[] = [];
  AllSalesGroups: SLSCustGroupData[] = [];
  displayedColumns: string[] = [
    'ORGANIZATION',
    'DIVISION',
    'PLANT',
    'PLANT_NAME',
    'ODIN',
    'INV_NO',
    'ITEM_NO',
    'INV_DATE',
    'INV_TYPE',
    'OUTBOUND_DELIVERY',
    'OUTBOUND_DELIVERY_DATE',
    'CUSTOMER',
    'CUSTOMER_NAME',
    'CUSTOMER_DESTINATION',
    'CUSTOMER_GROUP',
    'CUSTOMER_GROUP_DESC',
    'SECTOR_DESCRIPTION',
    'LR_NO',
    'LR_DATE',
    'VEHICLE_NO',
    'CARRIER',
    'VEHICLE_CAPACITY',
    'EWAYBILL_NO',
    'EWAYBILL_DATE',
    'FREIGHT_ORDER',
    'FREIGHT_ORDER_DATE',
    'PROPOSED_DELIVERY_DATE',
    'ACTUAL_DELIVERY_DATE',
    'TRANSIT_LEAD_TIME',
    'STATUS',
    'CHANGESTATUS',
  ];
  dataSource = new MatTableDataSource<InvoiceDetails>();
  selection = new SelectionModel<InvoiceDetails>(true, []);
  @ViewChild(MatPaginator,) paginator: MatPaginator;
  @ViewChild(MatSort,) sort: MatSort;
  InvoiceFilterFormGroup: FormGroup;
  AllStatusTemplates: StatusTemplate[] = [];
  isDateError: boolean;
  CurrentFilterClass: FilterClass = new FilterClass();
  currentCustomPage: number;
  records: number;
  isLoadMoreVisible: boolean;
  constructor(
    private _router: Router,
    private _reportService: ReportService,
    private _invoiceService: InvoiceService,
    private _masterService: MasterService,
    private _excelService: ExcelService,
    private _shareParameterService: ShareParameterService,
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe
  ) {
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.CurrentFilterClass = this._shareParameterService.GetPartialInvoiceFilterClass();
    this.FilteredInvoiceDetails = [];
    this.currentCustomPage = 1;
    this.records = 500;
    this.isLoadMoreVisible = false;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    this.selectedViewColumns = this.displayedColumns;
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.userID;
      this.currentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('PartiallyConfirmedInvoice') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    if (this.CurrentFilterClass) {
      this.InvoiceFilterFormGroup = this._formBuilder.group({
        StartDate: [this.CurrentFilterClass.StartDate],
        EndDate: [this.CurrentFilterClass.EndDate],
        InvoiceNumber: [this.CurrentFilterClass.InvoiceNumber ? this.CurrentFilterClass.InvoiceNumber : ''],
        Organization: [this.CurrentFilterClass.Organization ? this.CurrentFilterClass.Organization : ''],
        Division: [this.CurrentFilterClass.Division ? this.CurrentFilterClass.Division : ''],
        PlantList: [this.CurrentFilterClass.PlantList ? this.CurrentFilterClass.PlantList : []],
        CustomerName: [this.CurrentFilterClass.CustomerName ? this.CurrentFilterClass.CustomerName : ''],
        // ,
        CustomerGroup: [this.CurrentFilterClass.CustomerGroup ? this.CurrentFilterClass.CustomerGroup : []]
      });
    } else {
      this.InvoiceFilterFormGroup = this._formBuilder.group({
        StartDate: [],
        EndDate: [],
        InvoiceNumber: [''],
        Organization: [''],
        Division: [''],
        PlantList: [[]],
        CustomerName: [''],
        // ,
        CustomerGroup: [[]]
      });
    }
    this.isDateError = false;
    this.GetAllOrganizations();
    this.GetAllCustomerGroups();
    this.GetDivisions();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'CGID',
      textField: 'CustomerGroupCode',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.FilterPartiallyConfirmedInvoices();
    let selyt = JSON.parse(sessionStorage.getItem("SelectedLayout")) as string[];
    if (selyt) {
      this.selectedViewColumns = selyt;
    }
    else {
      this.selectedViewColumns = this.displayedColumns
    }
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  GetAllOrganizations(): void {
    this._masterService.GetAllOrganizations().subscribe(
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
    this._masterService.GetAllPlants().subscribe(
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
        // this.Divisions.unshift("All");
      },
      err => {
        this.isProgressBarVisibile = false;
      }
    );
  }
  SearchInvoices(): void {
    this.currentCustomPage = 1;
    this.FilteredInvoiceDetails = [];
    this.FilterPartiallyConfirmedInvoices();
  }
  LoadMoreData(): void {
    this.currentCustomPage = this.currentCustomPage + 1;
    this.FilterPartiallyConfirmedInvoices();
  }
  FilterPartiallyConfirmedInvoices(): void {
    if (this.InvoiceFilterFormGroup.valid) {
      if (!this.isDateError) {
        this.isProgressBarVisibile = true;
        const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as any;
        // if (Organization1 && Organization1.toLowerCase() === "all") {
        //   Organization1 = '';
        // }
        let Division = this.InvoiceFilterFormGroup.get('Division').value as any[];
        // let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        // if (Plant1 && Plant1.toLowerCase() === "all") {
        //   Plant1 = '';
        // }
        let plList = this.InvoiceFilterFormGroup.get('PlantList').value as any[];
        // if (plList && plList.length) {
        //   const index = plList.findIndex(x => x === "all");
        //   if (index > -1) {
        //     plList.splice(index, 1);
        //   }
        // }
        const CustomerName = this.InvoiceFilterFormGroup.get('CustomerName').value;
        let CustomerGroup = this.InvoiceFilterFormGroup.get('CustomerGroup').value as any[];
        // console.log(CustomerGroup);

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
        this.CurrentFilterClass.UserID = this.authenticationDetails.userID;
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.CurrentFilterClass.Records = this.records;
        this.CurrentFilterClass.CustomerGroup = CustomerGroup.length > 0 ? CustomerGroup : [];
        this._shareParameterService.SetPartialInvoiceFilterClass(this.CurrentFilterClass);
        this._invoiceService
          .FilterPartiallyConfirmedInvoicesForAdmin(this.CurrentFilterClass)
          .subscribe(
            data => {
              // this.FilteredInvoiceDetails = data as InvoiceDetails[];
              // this.allInvoicesCount = this.FilteredInvoiceDetails.length;
              const data1 = data as InvoiceDetails[];
              if (data1) {
                if (data.length < this.records) {
                  this.isLoadMoreVisible = false;
                } else {
                  this.isLoadMoreVisible = true;
                }
                data1.forEach(x => {
                  x.SECTOR_DESCRIPTION = this.GetSectorDescription(x.CUSTOMER_GROUP_DESC);
                  this.FilteredInvoiceDetails.push(x);
                });
              }
              this.dataSource = new MatTableDataSource(
                this.FilteredInvoiceDetails
              );
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
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

  isAllSelected(): boolean {
    if (this.selection && this.dataSource) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
    // return true;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    if (this.dataSource) {
      this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
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
  invoiceRowClick(inv: InvoiceDetails): void {
    const invoiceDetails: InvoiceDetails = new InvoiceDetails();
    invoiceDetails.HEADER_ID = inv.HEADER_ID;
    invoiceDetails.INV_NO = inv.INV_NO;
    invoiceDetails.ODIN = inv.ODIN;
    invoiceDetails.INV_DATE = inv.INV_DATE;
    invoiceDetails.INV_TYPE = inv.INV_TYPE;
    invoiceDetails.PLANT = inv.PLANT;
    invoiceDetails.CUSTOMER = inv.CUSTOMER;
    invoiceDetails.CUSTOMER_NAME = inv.CUSTOMER_NAME;
    invoiceDetails.VEHICLE_NO = inv.VEHICLE_NO;
    invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
    invoiceDetails.EWAYBILL_NO = inv.EWAYBILL_NO;
    invoiceDetails.OUTBOUND_DELIVERY = inv.OUTBOUND_DELIVERY;
    invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
    invoiceDetails.STATUS = inv.STATUS;
    this._shareParameterService.SetInvoiceDetail(invoiceDetails);
    this._router.navigate(['/pages/invItem']);
  }

  UpdateInvoiceStatus(STATUS: string, HeaderID: number): void {
    if (STATUS && STATUS.toLocaleLowerCase() === 'partiallyconfirmed') {
      const Actiontype = 'Change';
      const Catagory = 'Status to save';
      this.OpenConfirmationDialog(Actiontype, Catagory, HeaderID);
    } else {
      this.notificationSnackBarComponent.openSnackBar(
        'Invoice has to Partially Confirmed to update the status to save', SnackBarStatus.danger
      );
    }
  }
  OpenConfirmationDialog(Actiontype: string, Catagory: string, HeaderID: number): void {
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
          this.UpdatePartiallyConfirmedInvoiceStatus(HeaderID);
        }
      });
  }

  UpdatePartiallyConfirmedInvoiceStatus(HeaderID: number): void {
    const ActionLog = new UserActionHistory();
    ActionLog.Action = "Web";
    ActionLog.ChangesDetected = JSON.stringify("Status changed from Partially confirmed to saved");
    ActionLog.DateTime = new Date();
    ActionLog.IpAddress = this.authenticationDetails.ipAddress ? this.authenticationDetails.ipAddress : "";
    ActionLog.Location = this.authenticationDetails.geoLocation ? this.authenticationDetails.geoLocation : "";
    ActionLog.TransID = HeaderID;
    ActionLog.UserName = this.authenticationDetails.userName;
    forkJoin(this._invoiceService.UpdatePartiallyConfirmedInvoiceStatus(HeaderID,
      'Saved', this.currentUserID.toString()), this._invoiceService.CreateUserActionHistory(ActionLog)).subscribe((data) => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(`Invoice status changed to save`, SnackBarStatus.success);
        this.FilterPartiallyConfirmedInvoices();
      },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        });
  }

  exportAsXLSX(): void {
    if (this.InvoiceFilterFormGroup.valid) {
      if (!this.isDateError) {
        this.isProgressBarVisibile = true;
        const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as any;
        // if (Organization1 && Organization1.toLowerCase() === "all") {
        //   Organization1 = '';
        // }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        // let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        // if (Plant1 && Plant1.toLowerCase() === "all") {
        //   Plant1 = '';
        // }
        let plList = this.InvoiceFilterFormGroup.get('PlantList').value as string[];
        if (plList && plList.length) {
          const index = plList.findIndex(x => x === "all");
          if (index > -1) {
            plList.splice(index, 1);
          }
        }
        const CustomerName = this.InvoiceFilterFormGroup.get('CustomerName').value;
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
        this.CurrentFilterClass.Organization = Organization1;
        this.CurrentFilterClass.Division = Division;
        this.CurrentFilterClass.PlantList = plList;
        this.CurrentFilterClass.InvoiceNumber = InvoiceNumber;
        this.CurrentFilterClass.CustomerName = CustomerName;
        this.CurrentFilterClass.UserID = this.authenticationDetails.userID;
        this.CurrentFilterClass.CurrentPage = this.currentCustomPage;
        this.CurrentFilterClass.Records = this.records;
        this._shareParameterService.SetPartialInvoiceFilterClass(this.CurrentFilterClass);
        this._invoiceService
          .DownloadPartiallyConfirmedInvoices(this.CurrentFilterClass)
          .subscribe(
            data => {
              this.isProgressBarVisibile = false;
              const BlobFile = data as Blob;
              const currentDateTime = this._datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
              const fileName = 'Partially confirmed Invoices';
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
    // const itemsShowed = this.FilteredInvoiceDetails.slice(startIndex, endIndex);
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
    //   };
    //   itemsShowedd.push(item);
    // });
    // this._excelService.exportAsExcelFile(itemsShowedd, 'report');
  }
  ModifyLayout(): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        TableColumns: this.displayedColumns,
        selectedColumns: this.selectedViewColumns ? this.selectedViewColumns : this.displayedColumns
      },
      panelClass: 'confirmation-dialog'
    };
    let layoutRef = this.dialog.open(ModifyLayoutComponent, dialogConfig);
    layoutRef.afterClosed().subscribe((x: string[]) => {
      if (x) {
        // console.log(x);

        this.selectedViewColumns = x;
        sessionStorage.setItem("SelectedLayout", JSON.stringify(x));
      }
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
