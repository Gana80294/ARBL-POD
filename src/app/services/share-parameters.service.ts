import { Injectable } from '@angular/core';
import { FilterClass, InvoiceDetails, ReportInvoice, ReversePOD, ReversePODDashboard } from 'app/models/invoice-details';

@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentInvoiceDetail: InvoiceDetails;
  public CurrentReportInvoiceDetail: ReportInvoice;
  public CurrentDashboardFilterClass: FilterClass = new FilterClass();
  public CurrentInvoiceFilterClass: FilterClass = new FilterClass();
  public CurrentReportFilterClass: FilterClass = new FilterClass();
  public CurrentSavedInvoiceFilterClass: FilterClass = new FilterClass();
  public CurrentPartialInvoiceFilterClass: FilterClass = new FilterClass();
  public currentReverseLogisticDetail : ReversePODDashboard;
  constructor() { }
  SetReportInvoiceDetail(InvoiceDetail: ReportInvoice): void {
    this.CurrentReportInvoiceDetail = InvoiceDetail;
  }
  GetReportInvoiceDetail(): ReportInvoice {
    return this.CurrentReportInvoiceDetail;
  }
  SetInvoiceDetail(InvoiceDetail: InvoiceDetails): void {
    this.CurrentInvoiceDetail = InvoiceDetail;
  }
  GetInvoiceDetail(): InvoiceDetails {
    return this.CurrentInvoiceDetail;
  }
  SetDashboardFilterClass(filterClass: FilterClass): void {
    this.CurrentDashboardFilterClass = filterClass;
  }
  GetDashboardFilterClass(): FilterClass {
    return this.CurrentDashboardFilterClass;
  }
  SetInvoiceFilterClass(filterClass: FilterClass): void {
    this.CurrentInvoiceFilterClass = filterClass;
  }
  GetInvoiceFilterClass(): FilterClass {
    return this.CurrentInvoiceFilterClass;
  }
  SetReportFilterClass(filterClass: FilterClass): void {
    this.CurrentReportFilterClass = filterClass;
  }
  GetReportFilterClass(): FilterClass {
    return this.CurrentReportFilterClass;
  }
  SetSavedInvoiceFilterClass(filterClass: FilterClass): void {
    this.CurrentSavedInvoiceFilterClass = filterClass;
  }
  GetSavedInvoiceFilterClass(): FilterClass {
    return this.CurrentSavedInvoiceFilterClass;
  }
  SetPartialInvoiceFilterClass(filterClass: FilterClass): void {
    this.CurrentPartialInvoiceFilterClass = filterClass;
   
    
  }
  GetPartialInvoiceFilterClass(): FilterClass {
    // console.log(this.CurrentPartialInvoiceFilterClass);
    
    return this.CurrentPartialInvoiceFilterClass;
  }

  setReverseLogisticDetail(reverseLogisticDetail:ReversePODDashboard):void{
    this.currentReverseLogisticDetail = reverseLogisticDetail;
  }

  getReverseLogisticDetail():ReversePODDashboard{
    return this.currentReverseLogisticDetail;
  }
}
