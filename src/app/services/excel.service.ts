import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { GroupingDownloadParam } from 'app/models/master';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor(private datePipe: DatePipe) { }

    public exportAsExcelFile(json: any[], excelFileName: string): void {

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        // console.log('worksheet', worksheet);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,worksheet,"sheet1");
        XLSX.writeFile(wb,excelFileName);
        // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        // // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        // this.saveAsExcelFile(excelBuffer, excelFileName);
        // FileSaver.saveAs()
    }

    public exportXSLXUserWithFiltering(usrjson:any[],excelFileName: string, grpName:string){
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(usrjson);
        
        // console.log('worksheet', worksheet);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet  }, SheetNames: ['data'] };
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,worksheet,grpName);
        XLSX.writeFile(wb,this.datePipe.transform(new Date(), 'ddMMyyyyHHmmss')+excelFileName);
    }


    public exportXSLXUserWithGrouping(usrjson:GroupingDownloadParam){
        let i =0,j=0
        let worksheet: XLSX.WorkSheet;
        let wb: XLSX.WorkBook =  XLSX.utils.book_new();
        usrjson.AMGrouping.forEach(k=>{
            worksheet = XLSX.utils.json_to_sheet(k.AMXLSXparam);
        
            // console.log('worksheet', worksheet);
            
            
            XLSX.utils.book_append_sheet(wb,worksheet,k.XLsheetnames);
            
        })
        XLSX.writeFile(wb,usrjson.AMfilename);
        wb = XLSX.utils.book_new();
        usrjson.CustomerGrouping.forEach(k=>{
            worksheet = XLSX.utils.json_to_sheet(k.CustmentXLSXparam);
        
            // console.log('worksheet', worksheet);
            
            
            XLSX.utils.book_append_sheet(wb,worksheet,k.XLsheetnames);
            
        })
        XLSX.writeFile(wb,usrjson.Cfilename);

         
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        const currentDateTime = this.datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
        FileSaver.saveAs(data, fileName + '_' + currentDateTime + EXCEL_EXTENSION);
    }

    public exportTableToExcel(table: any, excelFileName: string): void {
        // converts a DOM TABLE element to a worksheet
        const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // /* save to file */s
        const currentDateTime = this.datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
        XLSX.writeFile(wb, excelFileName + '_' + currentDateTime + EXCEL_EXTENSION);
    }

}