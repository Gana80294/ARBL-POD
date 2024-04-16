import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { CustomerData, CustomerGroupData, OrganizationData, PlantData, ReasonData, SLSGroupData } from "app/models/master";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/snackbar-status-enum";
import { Observable } from "rxjs";
import * as XLSX from 'xlsx';
import { MasterService } from "./master.service";
import { ProgressBarBehaviourSubject } from "./ProgressBarBehaviourSubject.service";
@Injectable({
    providedIn: 'root'
})
export class DataMigration{
    arrayBuffer
    orgDatas:OrganizationData[]
    plntData:PlantData[]
    rsnData:ReasonData[]
    CustomerDatas: CustomerData[] = [];
    CustomerGroupDatas: CustomerGroupData[] =[];
    SalesGroupDatas: SLSGroupData[] = [];

    notificationSnackBarComponent: NotificationSnackBarComponent;
constructor(public snackBar: MatSnackBar,private _masterService: MasterService,private progbrBhvrsbjct:ProgressBarBehaviourSubject){
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
}
BulkUploadOrganization(file):Promise<any>{
   return new Promise(resolve=>{
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join("");
      const workbook = XLSX.read(bstr, { type: "binary" });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      this.orgDatas = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as OrganizationData[];
      
      if(this.orgDatas && this.orgDatas.length>0){
        this.progbrBhvrsbjct.setStatus = "show";
        this._masterService.CreateOrganizations(this.orgDatas).subscribe((x)=>{
          this.progbrBhvrsbjct.setStatus = "hide";
            this.notificationSnackBarComponent.openSnackBar('Organizations imported successfully', SnackBarStatus.success);
            resolve("success");        
          })
      }
      else{
        this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid organization data', SnackBarStatus.danger);
        this.progbrBhvrsbjct.setStatus = "hide";
        resolve("failed");
      }
    };
   })
}
BulkUploadPlant(file):Promise<any>{
 return new Promise(resolve=>{
  //  console.log("hrld");
   
    const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (e) => {
    this.arrayBuffer = fileReader.result;
    const data = new Uint8Array(this.arrayBuffer);
    const arr = new Array();
    for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
    const bstr = arr.join("");
    const workbook = XLSX.read(bstr, { type: "binary" });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    this.plntData = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as PlantData[];
    // console.log(this.plntData);
    
    if(this.plntData && this.plntData.length>0){
      this.progbrBhvrsbjct.setStatus = "show";
      this._masterService.CreatePlants(this.plntData).subscribe((x)=>{
          this.notificationSnackBarComponent.openSnackBar('plant imported successfully', SnackBarStatus.success);
          this.progbrBhvrsbjct.setStatus = "hide";
resolve("success");
          
        })
    }
    else{
      this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid plant data', SnackBarStatus.danger);
      this.progbrBhvrsbjct.setStatus = "hide";
      resolve("failed");
    }
  };
  })
}

BulkUploadReason(file):Promise<any>{
 return new Promise(resolve=>{
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (e) => {
    this.arrayBuffer = fileReader.result;
    const data = new Uint8Array(this.arrayBuffer);
    const arr = new Array();
    for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
    const bstr = arr.join("");
    const workbook = XLSX.read(bstr, { type: "binary" });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    this.rsnData = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as ReasonData[];
    
    if(this.rsnData && this.rsnData.length>0){
      this.progbrBhvrsbjct.setStatus = "show";
      this._masterService.CreateReasons(this.rsnData).subscribe((x)=>{
          this.notificationSnackBarComponent.openSnackBar('reason imported successfully', SnackBarStatus.success);
          this.progbrBhvrsbjct.setStatus = "hide";
          resolve("success")
        })
    }
    else{
      this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid reason data', SnackBarStatus.danger);
      this.progbrBhvrsbjct.setStatus = "hide";
      resolve("failed")
    }
  };
 })
}

BulkUploadUser(file): void {
 
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
   fileReader.onload = (e) => {
    this.arrayBuffer = fileReader.result;
    const data = new Uint8Array(this.arrayBuffer);
    const arr = new Array();
    for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
    const bstr = arr.join("");
    const workbook = XLSX.read(bstr, { type: "binary" });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    this.CustomerDatas = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as CustomerData[];
    
    if(this.CustomerDatas && this.CustomerDatas.length>0){
      this.progbrBhvrsbjct.setStatus = "show";
      this._masterService.CreateCustomers(this.CustomerDatas).subscribe((data) => {
        this.notificationSnackBarComponent.openSnackBar('Customer data submitted successfully', SnackBarStatus.success);
        this.progbrBhvrsbjct.setStatus = "hide";
      },
        (err) => {
          console.error(err);
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
          this.progbrBhvrsbjct.setStatus = "hide";
        });
    }
    else{
      this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid User data', SnackBarStatus.danger);
      this.progbrBhvrsbjct.setStatus = "hide";
    }
    
  };
}

BulkUploadCustomerGroup(file): Promise<any> {
 
  return new Promise((resolve)=>{
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join("");
      const workbook = XLSX.read(bstr, { type: "binary" });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      this.CustomerGroupDatas = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as CustomerGroupData[];
      // console.log(this.CustomerGroupDatas);
      
      if(this.CustomerGroupDatas && this.CustomerGroupDatas.length>0){
        this.progbrBhvrsbjct.setStatus = "show";
        this._masterService.CreateCustomerGroups(this.CustomerGroupDatas).subscribe((data) => {
          this.notificationSnackBarComponent.openSnackBar('Customer group data submitted successfully', SnackBarStatus.success);
          this.progbrBhvrsbjct.setStatus = "hide";
          resolve("success");
        },
          (err) => {
            console.error(err);
            this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            this.progbrBhvrsbjct.setStatus = "hide";
            resolve("failed");
          });
      }
      else{
        this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid data', SnackBarStatus.danger);
        this.progbrBhvrsbjct.setStatus = "hide";
        resolve("failed");
      }
    };
  })
}
BulkUploadSalesGroup(file): Promise<any> {
 return new Promise((resolve)=>{
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (e) => {
    this.arrayBuffer = fileReader.result;
    const data = new Uint8Array(this.arrayBuffer);
    const arr = new Array();
    for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
    const bstr = arr.join("");
    const workbook = XLSX.read(bstr, { type: "binary" });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    this.SalesGroupDatas = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as SLSGroupData[];
    
    if(this.SalesGroupDatas && this.SalesGroupDatas.length>0){
      this.progbrBhvrsbjct.setStatus = "show";
      this._masterService.CreateSalesGroups(this.SalesGroupDatas).subscribe((data) => {
        this.notificationSnackBarComponent.openSnackBar('Customer group data submitted successfully', SnackBarStatus.success);
        this.progbrBhvrsbjct.setStatus = "hide";
        resolve("success");
      },
        (err) => {
          console.error(err);
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
          this.progbrBhvrsbjct.setStatus = "hide";
          resolve("failed");
        });
    }
    else{
      this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid data', SnackBarStatus.danger);
      this.progbrBhvrsbjct.setStatus = "hide";
      resolve("failed");
    }
  };
 })
  
}


}