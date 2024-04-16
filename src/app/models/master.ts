import { Guid } from 'guid-typescript';

export class CustomerData {
    UserCode: string;
    UserName: string;
    Email: string;
    Password: string;
    ContactNumber: string;
}
export class OrganizationData {
    organizationCode: string;
    organizationDescription: string;
}
export class PlantData {
    plantCode: string;
    plantDescription: string;

    organization: string;

}
export class ReasonData {
    ReasonDescription: string;
}


export class UserWithRole {
    UserID: Guid;
    RoleID: Guid;
    UserName: string;
    UserCode: string;
    Email: string;
    Password: string;
    ContactNumber: string;
    OrganizationList: string[];
    PlantList: string[];
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
    CustomerGroup: string;
    SLSgroups: number[];
}



export class CustomerGroupData {
    customergroupCode: string
    sector: string;
    //  customergroupDescription :string
}

// export class UserCreationErrorLog
// {  
//       LogID :number
//       Date : Date

//      UserCode : string

//       UserName :string

//       Email :string

//       ContactNo :string

//       RoleName :string

//       LogReson :string

// }
export class resetPasswordOTPBody {
    UserName: string

}
export class OTPResponseBody {
    UserGuid: Guid
    OTPtranID: string



}

export class AffrimativeOTPBody {
    UserGuid: Guid

    newPassword: string

    recievedOTP: string

    OTPTransID: string


}
export class CustomeruserExportXLSXparam {
    UserCode: string
    UserName: string
    RoleName: string
    Email: string
    ContactNumber: string
    CreatedOn: string
    GroupName: string

}

export class AMuserExportXLSXparam {
    UserCode: string
    UserName: string
    RoleName: string
    Email: string
    ContactNumber: string
    CreatedOn: string
    GroupName: string
    Organization: string
    Plants: string

}

export class AMGroupingXLSXparam {


    XLsheetnames: string;
    AMXLSXparam: AMuserExportXLSXparam[];

}

export class CustomerGroupingXLSXparam {

    XLsheetnames: string;
    CustmentXLSXparam: CustomeruserExportXLSXparam[];
}

export class GroupingDownloadParam {
    AMfilename: string;
    Cfilename: string;
    AMGrouping: AMGroupingXLSXparam[];
    CustomerGrouping: CustomerGroupingXLSXparam[]
}


export class RolewithGroup {
    RoleName: string
    CustomerGroup: string
    CustomerGroupName: string

    RoleID: Guid
    UserID: Guid
}
export class OutputOTPBody {
    UserName: string


    Phone: string
    SiteUrl: string

}

export class ForgotPasswordModel {
    UserName: string;
    mode: string;
}
export class RoleWithApp {
    RoleID: Guid;
    RoleName: string;
    AppIDList: number[];
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class MenuApp {
    AppID: number;
    AppName: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class Reason {
    ReasonID: number;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}


export class AuthenticationDetails {
    isAuth: boolean;
    userID: Guid;
    userCode: string;
    userName: string;
    displayName: string;
    emailAddress: string;
    userRole: string;
    menuItemNames: string;
    profile: string;
    refreahToken: string;
    expires: string;
    issued: string;
    expiresin: string;
    ipAddress: string;
    geoLocation: string;
    plant:string;
}

export class geoLocation {
    latitude: number;
    longitude: number;
}

export class UserActionHistory {
    UserName: string;
    IpAddress: string;
    Location: string;
    TransID: number;
    Action: string;
    ChangesDetected: string;
    DateTime: Date;
}
export class UserActionHistoryView {
    InvoiceNumber: string;
    UserName: string;
    IpAddress: string;
    Location: string;
    TransID: number;
    Action: string;
    ChangesDetected: string;
    DateTime: Date;
}

export class ActionHistoryFilter {
    StartDate: Date | string | null;
    EndDate: Date | string | null;
    UserName: string;
    InvoiceNumber: string;
}

export class ChangesDetected {
    Item: Itemchanges[];
    Status: string;
    UnloadedDate: string;
    DocumentUpload: string;
    DocumentReUpload: string;
}
export class Itemchanges {
    ID: number;
    Item: string;
    Quantity: string;
    ReceivedQty: string;
    Remarks: string;
}
export class ChangePassword {
    UserID: Guid;
    UserName: string;
    CurrentPassword: string;
    NewPassword: string;
}
export class EMailModel {
    UserName: string;
    siteURL: string;
}
export class ForgotPassword {
    UserID: Guid;
    EmailAddress: string;
    NewPassword: string;
    Token: string;
}
export class UserNotification {
    ID: number;
    UserID: string;
    Message: string;
    HasSeen: boolean;
    CreatedOn: Date;
    ModifiedOn?: Date;
}
export class Organization {
    OrganizationCode: string;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class CustomerGroup {
    CGID: number;
    CustomerGroupCode: string;
    Sector: string;

    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}

export class SLSCustGroupData {
    SGID: string
    SLSGroupCode: string


    CustomerGroupCode: number[]

    Description: string

    IsActive: boolean

    CreatedOn: Date

    CreatedBy: string

    ModifiedOn: Date

    ModifiedBy: string
}

export class UserCreationErrorLog {
    LogID: number
    Date: Date | string

    UserCode: string

    UserName: string

    Email: string

    ContactNo: string

    RoleName: string

    LogReson: string

}
export class DownloadUserModel {

    Role: Guid;
    SGID: string[];
    isAmUser: boolean;

}

export class SLSGroup {

    SLSGroupCode: string;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class SLSGroupData {

    SLSGroupCode: string;
    Description: string;

}
export class Plant {
    PlantCode: string;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}

export class PlantGroup {
    Id: number;
    name: string;
}

export class PlantOrganizationMap {
    OrganizationCode: string;
    PlantCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class UserOrganizationMap {
    UserID: string;
    OrganizationCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class UserPlantMap {
    UserID: string;
    PlantCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class PlantWithOrganization {
    PlantCode: string;
    Description: string;
    OrganizationCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}

export class ScrollNotification {
    Id: number;
    Message: string;
    IsActive: boolean;
    Code: number;
}

export class DocumentHistoryView {
    Id: number;
    FileName: string;
    FileType: string;
    CreatedBy: string;
    CreatedOn: Date | string;
}
