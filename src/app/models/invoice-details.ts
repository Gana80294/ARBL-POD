import { Guid } from "guid-typescript";
import { UserActionHistory } from "./master";

export class InvoiceDetails {
    HEADER_ID: number;
    PLANT: string;
    PLANT_NAME: string;
    INV_NO: string;
    INV_DATE: Date | string | null;
    INV_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    ORGANIZATION: string;
    CUSTOMER_GROUP: string;
    DIVISION: string;
    ODIN: string;
    VEHICLE_NO: string;
    VEHICLE_CAPACITY: string;
    POD_DATE: Date | string | null;
    EWAYBILL_NO: string;
    EWAYBILL_DATE: Date | string | null;
    LR_NO: string;
    LR_DATE: Date | string | null;
    FWD_AGENT: string;
    CARRIER: string;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: Date | string | null;
    OUTBOUND_DELIVERY: string;
    OUTBOUND_DELIVERY_DATE: Date | string | null;
    ACTUAL_DISPATCH_DATE: Date | string | null;
    PROPOSED_DELIVERY_DATE: Date | string | null;
    VEHICLE_REPORTED_DATE: Date | string | null;
    ACTUAL_DELIVERY_DATE: Date | string | null;
    TRANSIT_LEAD_TIME: string;
    CANC_INV_STATUS: string;
    STATUS: string;
    STATUS_DESCRIPTION: string;
    ISXMLCREATED: boolean;
    XMLMOVED_ON: Date | string | null;
    CREATED_BY: string;
    CREATED_ON: Date | string;
    IS_ACTIVE: boolean;
    CUSTOMER_GROUP_DESC: string;
    SECTOR_DESCRIPTION: string;
    CUSTOMER_DESTINATION: string;
    PLANT_CODE: string;
    GROSS_WEIGHT: string;
    ATTACHMENT_ID: number;
    ATTACHMENT_NAME: string;
    DISTANCE: string;
    INVOICE_QUANTITY: number;
    DRIVER_CONTACT: string;
    TRACKING_LINK: string;
    TOTAL_TRAVEL_TIME: number;
    TOTAL_DISTANCE: number;
    DELIVERY_DATE: string;
    DELIVERY_TIME: string;
}

export class InvoiceItemDetails {
    ITEM_ID: number;
    ITEM_NO: string;
    HEADER_ID: number;
    MATERIAL_CODE: string;
    MATERIAL_DESCRIPTION: string;
    QUANTITY: string;
    RECEIVED_QUANTITY: string;
    QUANTITY_UOM: string;
    STATUS: string;
    STATUS_DESCRIPTION: string;
    REASON: string;
    REMARKS: string;
    CREATED_BY: string;
    CREATED_ON: Date | string;
    IS_ACTIVE: boolean;
}

export class ApproverDetails {
    ApprovedBy: string;
    HEADERIDs: number[];
}

export class InvoiceUpdation {
    VEHICLE_REPORTED_DATE: string;
    InvoiceItems: InvoiceItemDetails[];
}

export class InvoiceUpdation1 {
    VEHICLE_REPORTED_DATE: string;
    HEADER_ID: number;
}

export class ReportInvoice {
    HEADER_ID: number;
    INV_NO: string;
    ITEM_ID: number;
    ITEM_NO: string;
    INV_DATE: Date | string | null;
    INV_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    ORGANIZATION: string;
    DIVISION: string;
    ODIN: string;
    LR_NO: string;
    LR_DATE: Date | string | null;
    VEHICLE_NO: string;
    CARRIER: string;
    VEHICLE_CAPACITY: string;
    EWAYBILL_NO: string;
    EWAYBILL_DATE: Date | string | null;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: Date | string | null;
    MATERIAL_CODE: string;
    MATERIAL_DESCRIPTION: string;
    QUANTITY: string;
    RECEIVED_QUANTITY: string;
    QUANTITY_UOM: string;
    PLANT: string;
    PLANT_NAME: string;
    OUTBOUND_DELIVERY: string;
    OUTBOUND_DELIVERY_DATE: Date | string | null;
    ACTUAL_DISPATCH_DATE: Date | string | null;
    PROPOSED_DELIVERY_DATE: Date | string | null;
    VEHICLE_REPORTED_DATE: Date | string | null;
    ACTUAL_DELIVERY_DATE: Date | string | null;
    POD_UPLOADE_STATUS: string;
    TRANSIT_LEAD_TIME: string;
    CANC_INV_STATUS: string;
    STATUS: string;
    FWD_AGENT: string;
    ATTACHMENT_ID: number;
    ATTACHMENT_NAME: string;

    CUSTOMER_GROUP_DESC: string;

    SECTOR_DESCRIPTION: string;

    CUSTOMER_DESTINATION: string;

    PLANT_CODE: string;

    GROSS_WEIGHT: string;

    ITEM_WEIGHT: string;

    REMARKS: string;

    DISTANCE: string;
    DRIVER_CONTACT: string;
    TRACKING_LINK: string;
    TOTAL_TRAVEL_TIME: number;
    TOTAL_DISTANCE: number;
    DELIVERY_DATE: string;
    DELIVERY_TIME: string;
}

export class StatusTemplate {
    key: string;
    value: string;
}

export class DeliveryCount {
    TotalDelivery: number;
    InLineDelivery: number;
    DelayedDelivery: number;
}

export class InvoiceStatusCount {
    TotalInvoices: number;
    ConfirmedInvoices: number;
    PartiallyConfirmedInvoices: number;
    PendingInvoices: number;
    SavedInvoices: number;
}

export class InvoiceHeaderDetail {
    HEADER_ID: number;
    ORGANIZATION: string;
    DIVISION: string;
    PLANT: string;
    PLANT_NAME: string;
    INV_NO: string;
    ODIN: string;
    INV_DATE: Date | string | null;
    INV_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    VEHICLE_NO: string;
    VEHICLE_CAPACITY: string;
    LR_NO: string;
    LR_DATE: Date | string | null;
    EWAYBILL_NO: string;
    OUTBOUND_DELIVERY: string;
    PROPOSED_DELIVERY_DATE: Date | string | null;
    VEHICLE_REPORTED_DATE: Date | string | null;
    ACTUAL_DELIVERY_DATE: Date | string | null;
    STATUS: string;
    DRIVER_CONTACT: string;
    TRACKING_LINK: string;
    TOTAL_TRAVEL_TIME: number;
    TOTAL_DISTANCE: number;
    DELIVERY_DATE: string;
    DELIVERY_TIME: string;
}
export class AttachmentDetails {
    FileName: string;
    blob: Blob;
}

export class FilterClass {
    /**
     *
     */
    constructor() {
        var currDate = new Date();
        currDate.setMonth(currDate.getMonth() - 2);
        this.StartDate = currDate.toISOString().slice(0, 10);
    }
    UserID: Guid;
    UserCode: any;
    CurrentPage: number;
    Records: number;
    Status: string[];
    StartDate: string;
    EndDate: string = new Date().toISOString().slice(0, 10);
    InvoiceNumber: string;
    Organization: string[];
    Division: string[];
    Plant: string;
    PlantList: string[];
    PlantGroupList: string[];
    CustomerName: string;
    LRNumber: string;
    CustomerGroup: string[];
    LeadTime: string[];
    Delivery: string[];
}

export class AttachmentStatus {
    AttachmentId: number;
}

export class LRWithVehicleUnloaded {
    LRNumber: string;
    VehicleUnloadedDate: Date | string;
    Customer: string;
    LRDate: Date;
}

export class DeleteInvoice {
    InvNo: string;
    log: UserActionHistory;
}

// Region Reverse POD Starts

export class ReversePOD {
    RPOD_HEADER_ID: number;
    DC_NUMBER: string;
    DC_DATE: Date;
    INV_NO: string;
    CLAIM_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    PLANT: string;
    PLANT_NAME: string;
    LR_NO: string;
    LR_DATE: Date;
    STATUS: string;
    CUSTOMER_ATTACHMENT_ID: number;
    CUSTOMER_LR_DOC_NAME: string;
    DC_ATTACHMENT_ID: number;
    DC_LR_DOC_NAME: string;
    DC_RECEIEVED_DATE: Date | string | null;
    DC_ACKNOWLEDGEMENT_DATE: Date | string | null;
    SLA_DATE: Date | string | null;
    PENDING_DAYS: number;
}

export class ReversePodMaterialDetail {
    MATERIAL_ID: number;
    RPOD_HEADER_ID: number;
    MATERIAL_CODE: string;
    QUANTITY: number;
    HAND_OVERED_QUANTITY: number;
    CUSTOMER_PENDING_QUANTITY: number;
    RECEIVED_QUANTITY: number;
    DC_PENDING_QUANTITY: number;
    STATUS: string;
    REMARKS: string;
}

export class ReversePODFilter {
    UserID: Guid;
    UserCode: string;
    StartDate: Date | string | null;
    EndDate: Date | string | null;
    Status: string[] = [];
    PlantList: string[] = [];
    PlantGroupList: string[] = [];
    CustomerName: string;
    CurrentPage: number;
    Records: number;
}

export class ReversePodUpdation {
    LR_NO: string;
    LR_DATE: Date | string | null;
    RPOD_HEADER_ID: number;
    Status: number;
    DC_RECEIEVED_DATE: Date | string | null;
    DC_ACKNOWLEDGEMENT_DATE: Date | null;
    STATUS: string;
    MATERIALS: ReversePodItemUpdation[];
}

export class ReversePodItemUpdation {
    MATERIAL_ID: number;
    MATERIAL_CODE: string;
    HAND_OVERED_QUANTITY: number;
    RECEIVED_QUANTITY: number;
    REMARKS: string;
    STATUS: string;
}

export class ReversePodApprover {
    Id: number;
    UserId: Guid;
    IsApprover: boolean;
}

export class UpdateReverseLogistics {
    DC_NUMBER: string;
    HAND_OVERED_QUANTITY: number;
    LR_NO: string;
    LR_DATE: Date | string | null;
    RECEIVED_QUANTITY: number;
    DC_RECEIEVED_DATE: Date | string | null;
}

// Region Reverse POD Ends
