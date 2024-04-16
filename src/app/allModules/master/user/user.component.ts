import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatOption, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { UserWithRole, AuthenticationDetails, Plant, RoleWithApp, Organization, PlantOrganizationMap, PlantWithOrganization, CustomerGroup, RolewithGroup, CustomeruserExportXLSXparam, AMuserExportXLSXparam, GroupingDownloadParam, AMGroupingXLSXparam, CustomerGroupingXLSXparam, SLSCustGroupData, DownloadUserModel } from 'app/models/master';
import { FormGroup, Validators, FormBuilder, ValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { id } from '@swimlane/ngx-charts/release/utils';
import { DataMigration } from 'app/services/DataMigration.service';
import { ProgressBarBehaviourSubject } from 'app/services/ProgressBarBehaviourSubject.service';
import { UserCreationErrorLogComponent } from './user-creation-error-log/user-creation-error-log.component';
import { FuseNavigationItem } from '@fuse/types';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import { ThrowStmt } from '@angular/compiler';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { SelectAutocompleteComponent } from 'mat-select-autocomplete';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserComponent implements OnInit {
  @ViewChild('fileInput',) fileInput: ElementRef;
  // @ViewChild(SelectAutocompleteComponent) multiSelect: SelectAutocompleteComponent;
  MenuItems: string[];
  SalesGroupChanged = new FormControl();
  dropdownSettings: IDropdownSettings = {};
  OrgdropdownSettings = {};
  PlantdropdownSettings: IDropdownSettings = {};
  SalesropdownSettings: IDropdownSettings = {};
  SalesGroupInput = "";
  selectedOptions = [];
  currPage: number = 1;
  searchRole: string = "Customer";
  searchSalesgroup = "";
  FilterCurrPage: number = 1;

  AllUsersFilterLess: UserWithRole[] = [];
  AllUsers: UserWithRole[] = [];
  CopyAllUsers: UserWithRole[] = [];
  AllOrganizations: Organization[] = [];
  AllPlants: Plant[] = [];
  FilteredPlants: Plant[] = [];
  AllPlantOrganizationMaps: PlantOrganizationMap[] = [];
  SelectedUser: UserWithRole;

  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  userMainFormGroup: FormGroup;
  AllRoles: RoleWithApp[] = [];

  // fileToUpload: File;
  // fileUploader: FileUploader;
  baseAddress: string;
  slectedProfile: Uint8Array;
  IsPlantDisplay: boolean;
  roleWithGroup: RolewithGroup[] = [];
  AmarajaGrps: RolewithGroup[] = [];
  CustomerGrps: RolewithGroup[] = [];
  AllSalesGroups: SLSCustGroupData[] = [];
  FilteredSalesGroup: SLSCustGroupData[] = [];
  IsCustmoerGrpDisplay: boolean;
  infiniteScrollDisabled: boolean = false;
  AllCustomerGroups: CustomerGroup[];
  CustomerAndAMRoleIDs: any[] = [];
  BulkFile: File
  showcustomerGroupField = false;
  @ViewChild('allSelected') private allSelected: MatOption;
  @ViewChild('allSelected1') private allSelected1: MatOption;
  @ViewChild('allSelected2') private allSelected2: MatOption;
  @ViewChild('allSelected3') private allSelected3: MatOption;
  searchText: string;
  selectID: Guid;
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    private _excelservice: ExcelService,
    private _authService: AuthService,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _dataMigraton: DataMigration,
    private _datePipe: DatePipe,
    private progbrBhvrsbjct: ProgressBarBehaviourSubject,

  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;



    this.userMainFormGroup = this._formBuilder.group({
      userCode: ['', [Validators.required, Validators.pattern('^\\S*$')]],
      userName: ['', [Validators.required]],
      roleID: ['', Validators.required],
      CustomerGroup: [[]],
      groupingRole: ['Customer'],

      groupingSales: [],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern]],
      OrganizationList: [[]],
      PlantList: [[]],
      password: ['', [Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,15}$')]],
      confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
      profile: ['']
    });

    // this.userMainFormGroup.get('SalesGroupChanged').valueChanges.subscribe((p:string)=>{
    //  if(p){
    //  this.FilteredSalesGroup = this.AllSalesGroups.filter(k=>k.SLSGroupCode.toLowerCase().includes(p.toLowerCase()))
    //  }else{
    //    this.FilteredSalesGroup = this.AllSalesGroups;
    //  }


    // })



    this.userMainFormGroup.get('password').valueChanges.subscribe(
      (data) => {
        this.userMainFormGroup.get('confirmPassword').updateValueAndValidity();
      }

    );
    this._authService.GetCustomerGroupsWithRoleNames().subscribe((rwg) => {
      this.roleWithGroup = rwg;
      this.roleWithGroup.forEach((kk) => {
        if (!this.AmarajaGrps.find(j => j.CustomerGroupName == kk.CustomerGroupName) && kk.RoleName.toLowerCase() == "amararaja user") {
          this.AmarajaGrps.push(kk);
        }
        else if (!this.CustomerGrps.find(j => j.CustomerGroupName == kk.CustomerGroupName) && kk.RoleName.toLowerCase() == "customer") {
          this.CustomerGrps.push(kk);
        }
      });
      //console.log(this.CustomerGrps);

    })
    this.ChangeInProgressBarBehaviourSubject();
    this.searchText = '';
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedUser = new UserWithRole();
    this.authenticationDetails = new AuthenticationDetails();
    this.IsCustmoerGrpDisplay = false;
    this.IsPlantDisplay = false;
  }
  // (selectionChange)="CustomerGroupChanged($event)"
  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('User') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      // this.GetAllOrganizations();
      // this.GetAllPlants();
      // this.GetAllPlantOrganizationMaps();
      // this.GetAllRoles();
      // this.GetAllUsers();
      // this.GetAllSLSGroups();
      this.GetAllMasterData();
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'SGID',
        textField: 'SLSGroupCode',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true

      };

      this.SalesGroupChanged.valueChanges.subscribe((k: string) => {
        if (k) {


          this.FilteredSalesGroup = this.AllSalesGroups.filter(p => p.SLSGroupCode.toLowerCase().includes(k.toLowerCase()))

        }
        else {
          this.FilteredSalesGroup = this.AllSalesGroups
        }
      })

      //  this.GetAllCustomerGroups();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }

  GetAllMasterData() {
    this._masterService.GetAllOrganizations().subscribe(
      (data) => {
        this.AllOrganizations = data as Organization[];
        this._masterService.GetAllPlants().subscribe(
          (data) => {
            this.AllPlants = data as Plant[];
            this.FilteredPlants = data as Plant[];
            this._masterService.GetAllPlantOrganizationMaps().subscribe(
              (data) => {
                this.AllPlantOrganizationMaps = data as PlantWithOrganization[];
                this._masterService.GetAllRoles().subscribe(
                  (data) => {
                    if (this.authenticationDetails.userRole.toLocaleLowerCase().includes("coordinator")) {
                      var tmp = <RoleWithApp[]>data;

                      tmp.forEach(rle => {
                        if (rle.RoleName != "Administrator" && !rle.RoleName.toLocaleLowerCase().includes("coordinator")) {
                          this.AllRoles.push(rle);
                        }
                      })
                    }
                    else {
                      this.AllRoles = <RoleWithApp[]>data;
                    }
                    if (this.SelectedUser) {
                      this.CheckRole(this.SelectedUser.RoleID);
                    }
                    this.currPage = 1;
                    this.IsProgressBarVisibile = true;
                    this._masterService.GetAllUsers(this.currPage).subscribe(
                      (data) => {
                        this.AllUsers = <UserWithRole[]>data;
                        this.CopyAllUsers = this.AllUsers;
                        //console.log(this.AllUsers);
                        this.AllUsersFilterLess = this.AllUsers;
                        if (this.AllUsers.length && this.AllUsers.length > 0) {
                          this.AllUsers.filter(x => x.RoleID == this.AllRoles.find(k => k.RoleName == "Amararaja User").RoleID).forEach(o => {
                            this.CustomerAndAMRoleIDs.push(o.RoleID);
                          })

                          this.loadSelectedUser(this.AllUsers[0]);
                        }
                        this._masterService.GetAllSalesGroups().subscribe(
                          (data) => {
                            if (data) {
                              this.AllSalesGroups = data as SLSCustGroupData[];
                              //console.log(this.AllSalesGroups);

                              //     this.IsProgressBarVisibile = false;
                            }
                          },
                          (err) => {
                            console.error(err);
                            this.IsProgressBarVisibile = false;
                          }
                        );
                        this.IsProgressBarVisibile = false;
                        // console.log(this.AllUsers);
                      },
                      (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                      }
                    );
                  },
                  (err) => {
                    console.log(err);
                  }
                );
              },
              (err) => {
                console.error(err);
              }
            );
            // console.log(this.AllUsers);
          },
          (err) => {
            console.error(err);
            // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
          }
        );
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getSelectedOptions(selected) {
    this.selectedOptions = selected;
  }

  checkFilteredSalesGroup(val: string): Boolean {
    if (this.FilteredSalesGroup.length > 0) {
      if (this.FilteredSalesGroup.find(p => p.SLSGroupCode == val)) {


        return true;
      }
      else {


        return false;
      }
    }
    else {


      return true;
    }
  }
  SearchAndLoadUser() {
    if (this.searchText) {
      let usrs = this.CopyAllUsers.filter(k => k.UserCode == this.searchText || k.UserName.includes(this.searchText) || k.Email == this.searchText || k.ContactNumber == this.searchText);
      if (usrs.length > 0) {
        this.AllUsers = usrs;
      } else {
        this.FilterCurrPage = 1;
        this.IsProgressBarVisibile = true;
        this._masterService.GetAllUsersByKeyWord(this.searchText, this.FilterCurrPage).subscribe((k: UserWithRole[]) => {
          k.forEach(u => {
            this.CopyAllUsers.push(u)
          })
          this.AllUsers = k;
          this.FilterCurrPage++;
          this.IsProgressBarVisibile = false;
        },
          (err) => {
            this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            this.IsProgressBarVisibile = false;
          })
      }
    } else {
      this.AllUsers = this.CopyAllUsers
    }
  }
  OpenUserCreationLog() {
    const dialogConfig: MatDialogConfig = {

      panelClass: 'userCreationLog-dialog'
    };
    this.dialog.open(UserCreationErrorLogComponent, dialogConfig);
  }
  ResetControl(): void {
    this.selectID = null;
    this.SelectedUser = new UserWithRole();
    this.userMainFormGroup.reset();
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      // const control = this.userMainFormGroup.get(key);
      this.userMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  AddUser(): void {
    this.ResetControl();
    this.IsCustmoerGrpDisplay = true;
  }
  OnSalesGroupChanged(event) {
    console.log(event);


  }
  ChangeInProgressBarBehaviourSubject() {
    this.progbrBhvrsbjct.ProgressBarSubject.subscribe((x) => {
      if (x == "hide") {
        this.IsProgressBarVisibile = false;
      }
      else if (x == "show") {
        this.IsProgressBarVisibile = true;
      }
    })
  }
  searchRoleChanged(event) {
    console.log(event);


    this.searchRole = event.value;



  }
  exportAsXLSX() {
    this.IsProgressBarVisibile = true;
    let mdl: DownloadUserModel = new DownloadUserModel();
    let s = this.userMainFormGroup.get('groupingSales').value as any[];
    //console.log(s);

    //  if(s.indexOf("all")>0){
    //  s.splice(s.indexOf("all"),1);
    //  }
    mdl.Role = this.AllRoles.find(k => k.RoleName.toLowerCase() == this.searchRole.toLowerCase()).RoleID;
    mdl.SGID = [];

    let w = this.searchRole.toLowerCase() != "amararaja user" ? [] : (s ? this.AllSalesGroups.filter(k => s.find(p => k.SLSGroupCode == p)).map(k => k.SGID) : []);
    mdl.SGID = w;
    mdl.isAmUser = this.searchRole.toLowerCase() == "amararaja user" ? true : false;
    //console.log(mdl);

    this._masterService.DownloadUsersASXLSX(mdl).subscribe((blb: Blob) => {

      this.IsProgressBarVisibile = false;
      const BlobFile = blb as Blob;
      const currentDateTime = this._datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
      const fileName = 'users';
      const EXCEL_EXTENSION = '.xlsx';
      saveAs(BlobFile, fileName + '_' + currentDateTime + EXCEL_EXTENSION);
    },
      async err => {
        this.IsProgressBarVisibile = false;
        // const message = JSON.parse(await err.error).message;
        this.notificationSnackBarComponent.openSnackBar(
          JSON.parse(err).Message,
          SnackBarStatus.danger
        );
        console.log(err);

      })
  }
  BulkUpload(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.BulkFile = target.files[0];
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: 'create the Users with',
        Catagory: this.BulkFile.name
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this._dataMigraton.BulkUploadUser(this.BulkFile);
        }
      });
  }

  GetAllCustomerGroups(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllCustomerGroups().subscribe(
      (data) => {
        if (data) {
          this.AllCustomerGroups = data as CustomerGroup[];
          //console.log(this.AllCustomerGroups);

          if (this.AllCustomerGroups.length && this.AllCustomerGroups.length > 0) {

          }
          this.IsProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetAllOrganizations(): void {
    this._masterService.GetAllOrganizations().subscribe(
      (data) => {
        this.AllOrganizations = data as Organization[];
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
        // console.log(this.AllUsers);
      },
      (err) => {
        console.error(err);
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  GetAllPlantOrganizationMaps(): void {
    this._masterService.GetAllPlantOrganizationMaps().subscribe(
      (data) => {
        this.AllPlantOrganizationMaps = data as PlantWithOrganization[];
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetAllRoles(): void {
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        if (this.authenticationDetails.userRole.toLocaleLowerCase().includes("coordinator")) {
          var tmp = <RoleWithApp[]>data;
          tmp.forEach(rle => {
            if (rle.RoleName != "Administrator" && !rle.RoleName.toLocaleLowerCase().includes("coordinator")) {
              this.AllRoles.push(rle);
            }
          })
        }
        else {
          this.AllRoles = <RoleWithApp[]>data;
        }
        if (this.SelectedUser) {
          this.CheckRole(this.SelectedUser.RoleID);
        }
        // console.log(this.AllMenuApps);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  FilteredSelection(val: RolewithGroup) {
    this.AllUsers = this.AllUsersFilterLess.filter(k => k.RoleID == val.RoleID && k.CustomerGroup == val.CustomerGroup)
  }
  ClearCustomerGrpFilter() {
    this.AllUsers = this.AllUsersFilterLess;
  }

  GetAllSLSGroups(): void {
    //  this.IsProgressBarVisibile = true;
    this._masterService.GetAllSalesGroups().subscribe(
      (data) => {
        if (data) {
          this.AllSalesGroups = data as SLSCustGroupData[];
          //console.log(this.AllSalesGroups);

          //     this.IsProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetAllUsers(): void {
    this.currPage = 1;
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllUsers(this.currPage).subscribe(
      (data) => {
        this.AllUsers = <UserWithRole[]>data;
        this.CopyAllUsers = this.AllUsers;
        //console.log(this.AllUsers);
        this.AllUsersFilterLess = this.AllUsers;
        if (this.AllUsers.length && this.AllUsers.length > 0) {
          this.AllUsers.filter(x => x.RoleID == this.AllRoles.find(k => k.RoleName == "Amararaja User").RoleID).forEach(o => {
            this.CustomerAndAMRoleIDs.push(o.RoleID);

          })

          this.loadSelectedUser(this.AllUsers[0]);
        }
        this.IsProgressBarVisibile = false;
        // console.log(this.AllUsers);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  DownloadFilteredUsers() {
    let filename = this.AllRoles.find(x => x.RoleID == this.AllUsers[0].RoleID).RoleName + "-" + this.AllUsers[0].CustomerGroup + ".xlsx"
    let XLSXJSON = []
    this.AllUsers.forEach(k => {
      if (this.AllRoles.find(l => l.RoleID == k.RoleID).RoleName.toLowerCase() == "amararaja user") {
        let xl: AMuserExportXLSXparam = new AMuserExportXLSXparam();

        xl.UserName = k.UserName;
        xl.UserCode = k.UserCode;
        xl.RoleName = "Amararaja User"
        xl.ContactNumber = k.ContactNumber;
        xl.Email = k.Email;
        xl.GroupName = k.CustomerGroup;
        let strplnts = "";
        k.PlantList.forEach(p => {
          strplnts = p + "," + strplnts
        })
        let strorgs = "";
        k.OrganizationList.forEach(o => {
          strorgs = o + "," + strorgs;
        })
        xl.Plants = strplnts;
        xl.Organization = strorgs;

        xl.CreatedOn = k.CreatedOn.toString();

        XLSXJSON.push(xl)

      }
      else if (this.AllRoles.find(l => l.RoleID == k.RoleID).RoleName.toLowerCase() == "customer") {
        let xl: CustomeruserExportXLSXparam = new CustomeruserExportXLSXparam();

        xl.UserName = k.UserName;
        xl.UserCode = k.UserCode;
        xl.RoleName = "Customer"
        xl.ContactNumber = k.ContactNumber;
        xl.Email = k.Email;
        xl.GroupName = k.CustomerGroup;
        xl.CreatedOn = k.CreatedOn.toString();


        XLSXJSON.push(xl)

      }
    });
    this._excelservice.exportXSLXUserWithFiltering(XLSXJSON, filename, this.AllUsers[0].CustomerGroup);
  }
  DownloadUsersWithGrouping() {
    const DownloadJSON: GroupingDownloadParam = new GroupingDownloadParam();
    DownloadJSON.AMfilename = "Amararaja-users.xlsx";
    DownloadJSON.Cfilename = "Customer-users.xlsx";
    DownloadJSON.AMGrouping = [];
    DownloadJSON.CustomerGrouping = [];



    this.AmarajaGrps.forEach(u => {
      let AMxl: AMGroupingXLSXparam = new AMGroupingXLSXparam();
      AMxl.XLsheetnames = u.CustomerGroupName;
      AMxl.AMXLSXparam = []
      this.AllUsers.filter(k => k.RoleID == u.RoleID && k.CustomerGroup).forEach(o => {

        let xl: AMuserExportXLSXparam = new AMuserExportXLSXparam();

        xl.UserName = o.UserName;
        xl.UserCode = o.UserCode;
        xl.RoleName = "Amararaja User"
        xl.ContactNumber = o.ContactNumber;
        xl.Email = o.Email;
        xl.GroupName = o.CustomerGroup;
        let strplnts = "";
        o.PlantList.forEach(p => {
          strplnts = p + "," + strplnts
        })
        let strorgs = "";
        o.OrganizationList.forEach(l => {
          strorgs = l + "," + strorgs;
        })
        xl.Plants = strplnts;
        xl.Organization = strorgs;

        xl.CreatedOn = o.CreatedOn.toString();
        // console.log(xl);

        AMxl.AMXLSXparam.push(xl);
      });
      DownloadJSON.AMGrouping.push(AMxl);
    })
    this.CustomerGrps.forEach(u => {
      let Cxl: CustomerGroupingXLSXparam = new CustomerGroupingXLSXparam();
      Cxl.XLsheetnames = u.CustomerGroupName;
      Cxl.CustmentXLSXparam = []
      this.AllUsers.filter(k => k.RoleID == u.RoleID && k.CustomerGroup).forEach(o => {

        let xl: CustomeruserExportXLSXparam = new CustomeruserExportXLSXparam();

        xl.UserName = o.UserName;
        xl.UserCode = o.UserCode;
        xl.RoleName = "Customer"
        xl.ContactNumber = o.ContactNumber;
        xl.Email = o.Email;
        xl.GroupName = o.CustomerGroup;


        xl.CreatedOn = o.CreatedOn.toString();
        Cxl.CustmentXLSXparam.push(xl);
      });
      DownloadJSON.CustomerGrouping.push(Cxl)
    })
    this._excelservice.exportXSLXUserWithGrouping(DownloadJSON);
  }
  loadSelectedUser(selectedUser: UserWithRole): void {
    this.IsCustmoerGrpDisplay = false;
    this.ResetControl();
    // console.log(this.AllUsers);
    // console.log(this.AllRoles);

    this.SelectedUser = selectedUser;

    this.selectID = selectedUser.UserID;
    this.userMainFormGroup.get('userCode').patchValue(this.SelectedUser.UserCode);
    this.userMainFormGroup.get('userName').patchValue(this.SelectedUser.UserName);
    this.userMainFormGroup.get('OrganizationList').patchValue(this.SelectedUser.OrganizationList);
    // this.togglePerOne1();
    this.userMainFormGroup.get('PlantList').patchValue(this.SelectedUser.PlantList);

    // this.togglePerOne();
    this.userMainFormGroup.get('roleID').patchValue(this.SelectedUser.RoleID);
    this.userMainFormGroup.get('email').patchValue(this.SelectedUser.Email);
    this.userMainFormGroup.get('contactNumber').patchValue(this.SelectedUser.ContactNumber);
    this.CheckRole(this.SelectedUser.RoleID);
    this.userMainFormGroup.get('password').patchValue(this.SelectedUser.Password);
    this.userMainFormGroup.get('confirmPassword').patchValue(this.SelectedUser.Password);
    let sls = [];
    // console.log(this.SelectedUser.SLSgroups);

    this.SelectedUser.SLSgroups.forEach(p => {
      var slsg = this.AllSalesGroups.find(k => k.SGID == p.toString());
      if (slsg != undefined) {
        sls.push(slsg.SLSGroupCode);
      }
    });

    this.userMainFormGroup.get('CustomerGroup').patchValue(sls);
    // this.toggleSalesPerOne();
    this.userMainFormGroup.get('groupingRole').patchValue("Customer");
  }
  RoleSelected(event: any): void {
    this.CheckRole(event.value);
  }
  isCustomer() {
    if (this.CustomerAndAMRoleIDs.indexOf(this.SelectedUser.RoleID) >= 0) {
      return true;
    }
    //   else if(this.IsCustmoerGrpDisplay){
    // return true;
    //   }
    else {
      return false;
    }
  }
  CheckRole(roleID: Guid): void {
    const res = this.CheckIsAmarajaUser(roleID);

    if (res) {
      this.IsPlantDisplay = true;
      this.userMainFormGroup.get('OrganizationList').setValidators(Validators.required);
      this.userMainFormGroup.get('OrganizationList').updateValueAndValidity();
      this.userMainFormGroup.get('PlantList').setValidators(Validators.required);
      this.userMainFormGroup.get('PlantList').updateValueAndValidity();
      this.IsCustmoerGrpDisplay = true;

    } else {
      this.IsPlantDisplay = false;
      this.userMainFormGroup.get('OrganizationList').clearValidators();
      this.userMainFormGroup.get('OrganizationList').updateValueAndValidity();
      this.userMainFormGroup.get('PlantList').clearValidators();
      this.userMainFormGroup.get('PlantList').updateValueAndValidity();
      this.IsCustmoerGrpDisplay = false;
    }
  }
  CheckIsAmarajaUser(roleID: Guid): boolean {
    const rol = this.AllRoles.filter(x => x.RoleID === roleID)[0];
    if (rol) {
      return (rol.RoleName === "Amararaja User" ||  rol.RoleName === "Coordinator User");
      // return rol.RoleName.toLowerCase() != 'customer' && rol.RoleName.toLowerCase() != 'administrator' && !rol.RoleName.toLowerCase().includes('coordinator');
    }
    return false;
  }

  disableSpace(event): boolean {
    // this.AmountSelected();
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32) {
      return false;
    }
    return true;
  }

  CustomerGroupChanged(event: any) {

  }
  togglePerOne1(): boolean | void {
    if (this.allSelected1.selected) {
      this.allSelected1.deselect();
      this.getFilteredPlants();
      return false;
    }
    if (this.userMainFormGroup.get('OrganizationList').value.length) {
      if (this.userMainFormGroup.get('OrganizationList').value.length === this.AllOrganizations.length) {
        this.allSelected1.select();
      }
    }
    this.getFilteredPlants();
  }
  toggleAllSelection1(): void {
    if (this.allSelected1.selected) {
      const pls = this.AllOrganizations.map(x => x.OrganizationCode);
      pls.push("all");
      this.userMainFormGroup.get('OrganizationList').patchValue(pls);
    } else {
      this.userMainFormGroup.get('OrganizationList').patchValue([]);
    }
    this.getFilteredPlants();
  }

  toggleAllSelection2(): void {
    if (this.allSelected2.selected) {
      const pls = this.AllSalesGroups.map(x => x.SLSGroupCode);
      pls.push("all");
      this.userMainFormGroup.get('CustomerGroup').patchValue(pls);
    } else {
      this.userMainFormGroup.get('CustomerGroup').patchValue([]);
    }

  }

  toggleAllSelection3(): void {
    if (this.allSelected3.selected) {
      const pls = this.AllSalesGroups.map(x => x.SLSGroupCode);
      pls.push("all");
      this.userMainFormGroup.get('groupingSales').patchValue(pls);
    } else {
      this.userMainFormGroup.get('groupingSales').patchValue([]);
    }

  }

  getFilteredPlants(): void {
    const orgList = this.userMainFormGroup.get('OrganizationList').value as string[];
    if (orgList && orgList.length) {
      const plantOrgMap = this.AllPlantOrganizationMaps.filter(o => orgList.some(y => o.OrganizationCode === y));
      this.FilteredPlants = this.AllPlants.filter(o => plantOrgMap.some(y => o.PlantCode === y.PlantCode));
      const plList = this.userMainFormGroup.get('PlantList').value as string[];
      if (plList && plList.length) {
        const FilteredPlList = plList.filter(o => this.FilteredPlants.some(y => o === y.PlantCode));
        this.userMainFormGroup.get('PlantList').patchValue(FilteredPlList);
        this.togglePerOne();
      }
    }

  }

  togglePerOne(): boolean | void {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.userMainFormGroup.get('PlantList').value.length) {
      if (this.userMainFormGroup.get('PlantList').value.length === this.FilteredPlants.length) {
        this.allSelected.select();
      }
    }
  }
  toggleSalesPerOne() {
    if (this.allSelected2.selected) {
      this.allSelected2.deselect();
      return false;
    }
    if (this.userMainFormGroup.get('CustomerGroup').value.length) {
      if (this.userMainFormGroup.get('CustomerGroup').value.length === this.AllSalesGroups.length) {
        this.allSelected2.select();
      }
    }

  }

  toggleSalesGrpPerOne() {
    if (this.allSelected3.selected) {
      this.allSelected3.deselect();
      return false;
    }
    if (this.userMainFormGroup.get('groupingSales').value.length) {
      if (this.userMainFormGroup.get('groupingSales').value.length === this.AllSalesGroups.length) {
        this.allSelected3.select();
      }
    }

  }
  toggleAllSelection(): void {
    if (this.allSelected.selected) {
      const pls = this.FilteredPlants.map(x => x.PlantCode);
      pls.push("all");
      this.userMainFormGroup.get('PlantList').patchValue(pls);
    } else {
      this.userMainFormGroup.get('PlantList').patchValue([]);
    }
  }

  SaveClicked(): void {
    if (this.IsCustmoerGrpDisplay) {
      this.userMainFormGroup.get('CustomerGroup').clearValidators();
      this.userMainFormGroup.get('CustomerGroup').updateValueAndValidity();
    }

    // if (this.userMainFormGroup.valid) {
    // const file: File = this.fileToUpload;
    if (this.SelectedUser.UserID) {
      const dialogConfig: MatDialogConfig = {
        data: {
          Actiontype: 'Update',
          Catagory: 'User'
        },
        panelClass: 'confirmation-dialog'
      };
      const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        result => {
          if (result) {
            this.SelectedUser.UserCode = this.userMainFormGroup.get('userCode').value;
            this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
            let orgList = this.userMainFormGroup.get('OrganizationList').value as string[];
            if (orgList && orgList.length) {
              const index = orgList.findIndex(x => x === "all");
              if (index > -1) {
                orgList.splice(index, 1);
              }
            }
            this.SelectedUser.OrganizationList = orgList;
            let plList = this.userMainFormGroup.get('PlantList').value as string[];
            if (plList && plList.length) {
              const index = plList.findIndex(x => x === "all");
              if (index > -1) {
                plList.splice(index, 1);
              }
            }
            this.SelectedUser.PlantList = plList;
            this.SelectedUser.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
            this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
            this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
            this.SelectedUser.Password = this.userMainFormGroup.get('password').value;
            this.SelectedUser.ModifiedBy = this.authenticationDetails.userID.toString();
            let sls = this.userMainFormGroup.get('CustomerGroup').value as string[];
            let reqsls = [];
            sls.forEach(k => {
              if (k != "all") {
                reqsls.push(this.AllSalesGroups.find(p => p.SLSGroupCode == k).SGID);
              }

            })
            this.SelectedUser.SLSgroups = reqsls;
            this.IsProgressBarVisibile = true;
            this._masterService.UpdateUser(this.SelectedUser).subscribe(
              (data) => {
                // console.log(data);
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('User updated successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetAllUsers();
              },
              (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
              }
            );
          }
        }
      );

    }
    else {
      const dialogConfig: MatDialogConfig = {
        data: {
          Actiontype: 'Create',
          Catagory: 'User'
        },
        panelClass: 'confirmation-dialog'
      };
      const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        result => {
          if (result) {
            this.SelectedUser = new UserWithRole();
            this.SelectedUser.UserCode = this.userMainFormGroup.get('userCode').value;
            this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
            let orgList = this.userMainFormGroup.get('OrganizationList').value as string[];
            if (orgList && orgList.length) {
              const index = orgList.findIndex(x => x === "all");
              if (index > -1) {
                orgList.splice(index, 1);
              }
            }
            this.SelectedUser.OrganizationList = orgList;
            let plList = this.userMainFormGroup.get('PlantList').value as string[];
            if (plList && plList.length) {
              const index = plList.findIndex(x => x === "all");
              if (index > -1) {
                plList.splice(index, 1);
              }
            }
            this.SelectedUser.PlantList = plList;
            // this.user.PlantList = this.userMainFormGroup.get('PlantList').value;
            this.SelectedUser.RoleID = this.userMainFormGroup.get('roleID').value;
            this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
            this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
            this.SelectedUser.Password = this.userMainFormGroup.get('password').value;
            let sls = this.userMainFormGroup.get('CustomerGroup').value as string[];
            let reqsls = [];
            if (sls) {
              sls.forEach(k => {
                if (k != "all")
                  reqsls.push(this.AllSalesGroups.find(p => p.SLSGroupCode == k).SGID);
              })
            }

            this.SelectedUser.SLSgroups = reqsls;
            this.SelectedUser.CreatedBy = this.authenticationDetails.userID.toString();
            // this.user.Profile = this.slectedProfile;
            this.IsProgressBarVisibile = true;
            this._masterService.CreateUser(this.SelectedUser).subscribe(
              (data) => {
                // console.log(data);
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('User created successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetAllUsers();
              },
              (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
              }
            );
          }
        });
    }
    // }
    // else {
    //   Object.keys(this.userMainFormGroup.controls).forEach(key => {
    //     this.userMainFormGroup.get(key).markAsTouched();
    //     this.userMainFormGroup.get(key).markAsDirty();
    //   });
    // }
  }

  DeleteClicked(): void {
    // if (this.userMainFormGroup.valid) {
    if (this.SelectedUser.UserID) {
      const dialogConfig: MatDialogConfig = {
        data: {
          Actiontype: 'Delete',
          Catagory: 'User'
        },
        panelClass: 'confirmation-dialog'
      };
      const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        result => {
          if (result) {
            this.SelectedUser.UserCode = this.userMainFormGroup.get('userCode').value;
            this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
            this.SelectedUser.PlantList = this.userMainFormGroup.get('PlantList').value;
            this.SelectedUser.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
            this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
            this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
            this.SelectedUser.Password = this.userMainFormGroup.get('password').value;
            this.SelectedUser.ModifiedBy = this.authenticationDetails.userID.toString();
            this.IsProgressBarVisibile = true;
            this._masterService.DeleteUser(this.SelectedUser).subscribe(
              (data) => {
                // console.log(data);
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('User deleted successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetAllUsers();
              },
              (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
              }
            );
          }
        });
    }
    else {
      this.notificationSnackBarComponent.openSnackBar('Unable to find the User ID', SnackBarStatus.danger)
    }
    // }
    // else {
    //   Object.keys(this.userMainFormGroup.controls).forEach(key => {
    //     this.userMainFormGroup.get(key).markAsTouched();
    //     this.userMainFormGroup.get(key).markAsDirty();
    //   });
    // }
  }

  OnUserSelectionChanged(selectedUser: UserWithRole): void {
    // console.log(selectedMenuApp);
    this.SelectedUser = selectedUser;



  }
  OnShowProgressBarEvent(status: string): void {
    if (status === 'show') {
      this.IsProgressBarVisibile = true;
    } else {
      this.IsProgressBarVisibile = false;
    }

  }

  RefreshAllUsers(msg: string): void {
    // console.log(msg);
    this.GetAllUsers();
  }
  onScrollBeyondThreshold() {
    this.infiniteScrollDisabled = true;
    this.currPage += 1;
    console.log("Scroll Triggred..");

    this._masterService.GetAllUsers(this.currPage).subscribe((data: UserWithRole[]) => {
      data.forEach(u => {
        this.AllUsers.push(u);
        this.CopyAllUsers = this.AllUsers;
      })


    })
  }
}


export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const confirmPassword = control.parent.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (confirmPassword.value === '') {
    return null;
  }

  if (password.value === confirmPassword.value) {
    return null;
  }

  return { 'passwordsNotMatching': true };
};