import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, Plant, PlantOrganizationMap, PlantWithOrganization, Organization } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { DataMigration } from 'app/services/DataMigration.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-plant',
  templateUrl: './plant.component.html',
  styleUrls: ['./plant.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PlantComponent implements OnInit {
  @ViewChild('fileInput', ) fileInput: ElementRef;
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  BulkFile: File;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  DistinctPlants: string[] = [];
  AllOrganizations: Organization[] = [];
  AllPlants: PlantWithOrganization[] = [];
  SelectedPlant: PlantWithOrganization;
  searchText = '';
  selectID = '';
  PlantFormGroup: FormGroup;
  KeysFormArray: FormArray = this._formBuilder.array([]);
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _dataMigraton: DataMigration
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.PlantFormGroup = this._formBuilder.group({
      PlantCode: ['', Validators.required],
      Description: ['', Validators.required],
      OrganizationCode: ['', Validators.required]
    });
    this.SelectedPlant = new PlantWithOrganization();
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.userName;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Plant') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllOrganizations();
      this.GetAllPlants();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ResetControl(): void {
    this.selectID = '';
    this.SelectedPlant = new PlantWithOrganization();
    this.PlantFormGroup.reset();
    Object.keys(this.PlantFormGroup.controls).forEach(key => {
      this.PlantFormGroup.get(key).markAsUntouched();
    });

  }

  AddPlant(): void {
    this.ResetControl();
  }
  BulkUpload(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.BulkFile = target.files[0];
    this.OpenConfirmationDialog(" create the plants with ", this.BulkFile.name);
  }
  GetAllOrganizations(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllOrganizations().subscribe(
      (data) => {
        if (data) {
          this.AllOrganizations = data as Organization[];
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetAllPlants(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllPlants().subscribe(
      (data) => {
        if (data) {
          this.AllPlants = data as PlantWithOrganization[];
          if (this.AllPlants.length && this.AllPlants.length > 0) {
            this.loadSelectedPlant(this.AllPlants[0]);
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

  loadSelectedPlant(plant: PlantWithOrganization): void {
    this.ResetControl();
    this.SelectedPlant = plant;
    this.selectID = plant.PlantCode;
    this.PlantFormGroup.get('PlantCode').patchValue(plant.PlantCode);
    this.PlantFormGroup.get('Description').patchValue(plant.Description);
    this.PlantFormGroup.get('OrganizationCode').patchValue(plant.OrganizationCode);
  }

  SaveClicked(): void {
    if (this.PlantFormGroup.valid) {
      this.GetPlantValues();
      if (this.SelectedPlant.CreatedBy) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.PlantFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.PlantFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.PlantFormGroup);
    }
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });
  }

  OpenConfirmationDialog(Actiontype: string, filename?: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: filename ?   filename :'Plant'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreatePlant();
          } else if (Actiontype === 'Update') {
            this.UpdatePlant();
          } else if (Actiontype === 'Delete') {
            this.DeletePlant();
          }
          else if (Actiontype === ' create the plants with ') {
            console.log("BulkFile");

            this._dataMigraton.BulkUploadPlant(this.BulkFile).then(()=>{
              this.GetAllOrganizations();
              this.GetAllPlants();
            })
              
           
            
          }
        }
      });
  }

  GetPlantValues(): void {
    this.SelectedPlant.PlantCode = this.PlantFormGroup.get('PlantCode').value;
    this.SelectedPlant.Description = this.PlantFormGroup.get('Description').value;
    this.SelectedPlant.OrganizationCode = this.PlantFormGroup.get('OrganizationCode').value;
  }
  CreatePlant(): void {
    this.SelectedPlant.CreatedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreatePlant(this.SelectedPlant).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Plant created successfully', SnackBarStatus.success);
        this.GetAllPlants();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  UpdatePlant(): void {
    this.SelectedPlant.ModifiedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdatePlant(this.SelectedPlant).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Plant updated successfully', SnackBarStatus.success);
        this.GetAllPlants();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  DeletePlant(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DeletePlant(this.SelectedPlant).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Plant deleted successfully', SnackBarStatus.success);
        this.GetAllPlants();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  exportAsXLSX(){
    // console.log(this.AllPlants,"Allorg");
    var plants=[];
    this.AllPlants.forEach(item => {
      var temp=new PlantWithOrganization();
      temp.PlantCode=item.PlantCode;
      temp.Description=item.Description;
      temp.OrganizationCode=item.OrganizationCode;
      plants.push(temp);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(plants);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelFileName = "Plant"
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    const EXCEL_EXTENSION =".xlsx"
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

}
