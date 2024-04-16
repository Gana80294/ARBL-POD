import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { AttachmentDetails } from 'app/models/invoice-details';
import { UserCreationErrorLog } from 'app/models/master';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';

@Component({
  selector: 'app-user-creation-error-log',
  templateUrl: './user-creation-error-log.component.html',
  styleUrls: ['./user-creation-error-log.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserCreationErrorLogComponent implements OnInit {

  public AttachmentData: any;
  public pdfbool=false;
  ErrorLog:UserCreationErrorLog[];
  TableColumns = ["UserName","UserCode","Email","ContactNo","Date","RoleName","LogReason"];
  DataSource : MatTableDataSource<UserCreationErrorLog>;
  @ViewChild(MatPaginator, ) paginator: MatPaginator;
    @ViewChild(MatSort, ) sort: MatSort;
  constructor(
    public matDialogRef: MatDialogRef<UserCreationErrorLogComponent>,private datePipe:DatePipe,private _mastersrvice : MasterService,private XLservice:ExcelService) { 
      this._mastersrvice.GetUserCreationErrorLog().subscribe((x:UserCreationErrorLog[])=>{
       this.ErrorLog  = x;
       this.ErrorLog.forEach(p=>{
        p.Date = this.datePipe.transform(p.Date,"dd-MM-yyyy")
       });
        this.DataSource = new MatTableDataSource(x);
        this.DataSource.paginator = this.paginator;
    this.DataSource.sort = this.sort;
            });
    }

  ngOnInit(): void {
    
  }

  CloseClicked(): void {
    this.matDialogRef.close(null);
  }
  DownloadErrorLog(){
this.XLservice.exportAsExcelFile(this.ErrorLog,"UserErrorLog.xlsx");
  }
  applyFilter(filterValue: string) {
    this.DataSource.filter = filterValue.trim().toLowerCase();

    if (this.DataSource.paginator) {
      this.DataSource.paginator.firstPage();
    }
  }
  

}
