import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, Subject } from "rxjs";

import { AuthService } from "./auth.service";
import { catchError } from "rxjs/operators";
import {
    MenuApp,
    RoleWithApp,
    UserWithRole,
    UserNotification,
    Reason,
    Plant,
    PlantWithOrganization,
    Organization,
    PlantOrganizationMap,
    CustomerData,
    OrganizationData,
    PlantData,
    ReasonData,
    CustomerGroup,
    CustomerGroupData,
    UserCreationErrorLog,
    RolewithGroup,
    SLSGroup,
    SLSGroupData,
    SLSCustGroupData,
    DownloadUserModel,
    ScrollNotification,
    PlantGroup,
} from "app/models/master";
import { Guid } from "guid-typescript";

@Injectable({
    providedIn: "root",
})
export class MasterService {
    baseAddress: string;
    NotificationEvent: Subject<any>;

    GetNotification(): Observable<any> {
        return this.NotificationEvent.asObservable();
    }

    TriggerNotification(eventName: string): void {
        this.NotificationEvent.next(eventName);
    }

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
        this.baseAddress = _authService.baseAddress;
        this.NotificationEvent = new Subject();
    }

    // Error Handler
    errorHandler(error: HttpErrorResponse): Observable<any> {
        console.log(error.message);
        console.log(error);
        return throwError(error.error || error.message || "Server Error");
    }

    // App
    CreateMenuApp(menuApp: MenuApp): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/CreateApp`, menuApp, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllMenuApp(): Observable<MenuApp[] | string> {
        return this._httpClient
            .get<MenuApp[]>(`${this.baseAddress}api/Master/GetAllApps`)
            .pipe(catchError(this.errorHandler));
    }

    UpdateMenuApp(menuApp: MenuApp): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/UpdateApp`, menuApp, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteMenuApp(menuApp: MenuApp): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/DeleteApp`, menuApp, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    // Organization
    CreateOrganization(organization: Organization): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateOrganization`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllOrganizations(): Observable<Organization[] | string> {
        return this._httpClient
            .get<Organization[]>(
                `${this.baseAddress}api/Master/GetAllOrganizations`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllOrganizationsByUserID(
        UserID: Guid
    ): Observable<Organization[] | string> {
        return this._httpClient
            .get<Organization[]>(
                `${this.baseAddress}api/Master/GetAllOrganizationsByUserID?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateOrganization(organization: Organization): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/UpdateOrganization`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteOrganization(organization: Organization): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/DeleteOrganization`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    //CustomerGroup
    CreateCustomerGroup(organization: CustomerGroup): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateCustomerGroup`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    GetAllCustomerGroups(): Observable<CustomerGroup[] | string> {
        return this._httpClient
            .get<CustomerGroup[]>(
                `${this.baseAddress}api/Master/GetAllCustomerGroups`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllCustomerGroupsB(): Observable<CustomerGroup[] | string> {
        return this._httpClient
            .get<CustomerGroup[]>(
                `${this.baseAddress}api/Master/GetAllCustomerGroups`
            )
            .pipe(catchError(this.errorHandler));
    }
    GetAllCustomerGroupsByUserID(
        UserID: Guid
    ): Observable<CustomerGroup[] | string> {
        return this._httpClient
            .get<CustomerGroup[]>(
                `${this.baseAddress}api/Master/GetAllCustomerGroupsByUserID?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }
    GetSectorByCustomerGroup(code: string): Observable<CustomerGroup | string> {
        return this._httpClient
            .get<CustomerGroup>(
                `${this.baseAddress}api/Master/GetSectorByCustomerGroup?CustomerGroupCode=${code}`
            )
            .pipe(catchError(this.errorHandler));
    }
    UpdateCustomerGroup(organization: CustomerGroup): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/UpdateCustomerGroup`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    DeleteCustomerGroup(organization: CustomerGroup): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/DeleteCustomerGroup`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    //SalesGroup
    CreateSalesGroup(organization: SLSCustGroupData): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateSalesGroup`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    GetAllSalesGroups(): Observable<SLSCustGroupData[] | string> {
        return this._httpClient
            .get<SLSCustGroupData[]>(
                `${this.baseAddress}api/Master/GetAllSalesGroups`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateSalesGroup(organization: SLSCustGroupData): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/UpdateSalesGroup`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    DeleteSalesGroup(organization: SLSCustGroupData): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/DeleteSalesGroup`,
                organization,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    // Plant
    CreatePlant(plant: PlantWithOrganization): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/CreatePlant`, plant, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllPlants(): Observable<PlantWithOrganization[] | string> {
        return this._httpClient
            .get<PlantWithOrganization[]>(
                `${this.baseAddress}api/Master/GetAllPlants`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllPlantsByUserID(
        UserID: Guid
    ): Observable<PlantWithOrganization[] | string> {
        return this._httpClient
            .get<PlantWithOrganization[]>(
                `${this.baseAddress}api/Master/GetAllPlantsByUserID?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllPlantGroups(
    ): Observable<PlantGroup[] | string> {
        return this._httpClient
            .get<PlantGroup[]>(
                `${this.baseAddress}api/Master/GetAllPlantGroups`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdatePlant(plant: PlantWithOrganization): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/UpdatePlant`, plant, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    DeletePlant(plant: Plant): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/DeletePlant`, plant, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllPlantOrganizationMaps(): Observable<PlantOrganizationMap[] | string> {
        return this._httpClient
            .get<PlantOrganizationMap[]>(
                `${this.baseAddress}api/Master/GetAllPlantOrganizationMaps`
            )
            .pipe(catchError(this.errorHandler));
    }

    // Reason
    CreateReason(reason: Reason): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/CreateReason`, reason, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllReasons(): Observable<Reason[] | string> {
        return this._httpClient
            .get<Reason[]>(`${this.baseAddress}api/Master/GetAllReasons`)
            .pipe(catchError(this.errorHandler));
    }

    UpdateReason(reason: Reason): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/UpdateReason`, reason, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteReason(reason: Reason): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/DeleteReason`, reason, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    // Role
    CreateRole(role: RoleWithApp): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/CreateRole`, role, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllRoles(): Observable<RoleWithApp[] | string> {
        return this._httpClient
            .get<RoleWithApp[]>(`${this.baseAddress}api/Master/GetAllRoles`)
            .pipe(catchError(this.errorHandler));
    }

    UpdateRole(role: RoleWithApp): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/UpdateRole`, role, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteRole(role: RoleWithApp): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/DeleteRole`, role, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    // Users

    CreateUser1(user: UserWithRole, file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append("uploadFile", file, file.name);
        formData.append("userName", user.UserName);

        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateUser1`,
                formData
                // {
                //   headers: new HttpHeaders({
                //     'Content-Type': 'application/json'
                //   })
                // }
            )
            .pipe(catchError(this.errorHandler));
    }

    CreateUser(user: UserWithRole): Observable<any> {
        // const formData: FormData = new FormData();
        // // if (selectedFile) {
        // //   formData.append('selectedFile', selectedFile, selectedFile.name);
        // // }
        // // formData.append('UserID', user.UserID.toString());
        // formData.append('UserName', user.UserName);
        // formData.append('Plant', user.Plant);
        // formData.append('Email', user.Email);
        // formData.append('ContactNumber', user.ContactNumber);
        // formData.append('Password', user.Password);
        // formData.append('RoleID', user.RoleID.toString());
        // formData.append('CreatedBy', user.CreatedBy);

        // return this._httpClient.post<any>(`${this.baseAddress}api/Master/CreateUser`,
        //   formData,
        //   // {
        //   //   headers: new HttpHeaders({
        //   //     'Content-Type': 'application/json'
        //   //   })
        //   // }
        // ).pipe(catchError(this.errorHandler));
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/CreateUser`, user, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllUsers(page: number): Observable<UserWithRole[] | string> {
        return this._httpClient
            .get<UserWithRole[]>(
                `${this.baseAddress}api/Master/GetAllUsers?Page=${page}`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllUsersByKeyWord(
        key: string,
        page: number
    ): Observable<UserWithRole[] | string> {
        return this._httpClient
            .get<UserWithRole[]>(
                `${this.baseAddress}api/Master/GetSearchedUser?key=${key}&Page=${page}`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateUser(user: UserWithRole): Observable<any> {
        // const formData: FormData = new FormData();
        // // if (selectedFile) {
        // //   formData.append('selectedFile', selectedFile, selectedFile.name);
        // // }
        // formData.append('UserID', user.UserID.toString());
        // formData.append('UserName', user.UserName);
        // formData.append('Plant', user.Plant);
        // formData.append('Email', user.Email);
        // formData.append('ContactNumber', user.ContactNumber);
        // formData.append('Password', user.Password);
        // formData.append('RoleID', user.RoleID.toString());
        // formData.append('CreatedBy', user.CreatedBy);
        // formData.append('ModifiedBy', user.ModifiedBy);
        // return this._httpClient.post<any>(`${this.baseAddress}api/Master/UpdateUser`,
        //   formData,
        //   // {
        //   //   headers: new HttpHeaders({
        //   //     'Content-Type': 'application/json'
        //   //   })
        //   // }
        // ).pipe(catchError(this.errorHandler));
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/UpdateUser`, user, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteUser(user: UserWithRole): Observable<any> {
        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/DeleteUser`, user, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            })
            .pipe(catchError(this.errorHandler));
    }

    DownloadUsersASXLSX(user: DownloadUserModel): Observable<any> {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
        });
        return this._httpClient
            .post(
                `${this.baseAddress}api/Master/DownloadUsersExcell`,
                user,

                { headers: headers, responseType: "blob" }
            )
            .pipe(catchError(this.parseErrorBlob));
    }

    parseErrorBlob(err: HttpErrorResponse): Observable<any> {
        const reader: FileReader = new FileReader();

        const obs = Observable.create((observer: any) => {
            reader.onloadend = (e) => {
                observer.error(reader.result);
                observer.complete();
            };
        });
        reader.readAsText(err.error);
        return obs;
    }
    CreateCustomers(custData: CustomerData[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateCustomers`,
                custData,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    CreateCustomerGroups(custData: CustomerGroupData[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateBulkCustomerGroup`,
                custData,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    CreateSalesGroups(custData: SLSGroupData[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateBulkSalesGroup`,
                custData,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetUserCreationErrorLog(): Observable<any> {
        return this._httpClient
            .get<UserCreationErrorLog[]>(
                `${this.baseAddress}api/Master/GetUserCreationErrorLog`
            )
            .pipe(catchError(this.errorHandler));
    }

    CreateOrganizations(orgData: OrganizationData[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateBulkOrganization`,
                orgData,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    CreatePlants(pltData: PlantData[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateBulkPlant`,
                pltData,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    CreateReasons(rsnData: ReasonData[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Master/CreateBulkReason`,
                rsnData,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    GetAllNotificationByUserID(
        UserID: string
    ): Observable<UserNotification[] | string> {
        return this._httpClient
            .get<UserNotification[]>(
                `${this.baseAddress}api/Notification/GetAllNotificationByUserID?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateNotification(
        SelectedNotification: UserNotification
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/Notification/UpdateNotification`,
                SelectedNotification,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateLRDateByInvoiceNo(LRUpdate: any): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PodConfirmation/UpdateLRDateByInvoiceNo`,
                LRUpdate,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateLRNumberByInvoiceNo(LRUpdate: any): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PodConfirmation/UpdateLRNumberByInvoiceNo`,
                LRUpdate,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    SaveScrollNotification(notification: ScrollNotification): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PodConfirmation/SaveScrollNotification`,
                notification,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetScrollNotification(): Observable<any> {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}api/PodConfirmation/GetScrollNotification`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetDocumentHistoryById(invoiceNumber: string): Observable<any> {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}api/PodConfirmation/GetDocumentHistoryById?invoiceNumber=${invoiceNumber}`
            )
            .pipe(catchError(this.errorHandler));
    }

    DowloandHistoryDocument(id: number): Observable<Blob | string> {
        return this._httpClient
            .get(
                `${this.baseAddress}api/PodConfirmation/DowloandHistoryDocument?id=${id}`,
                {
                    responseType: "blob",
                    headers: new HttpHeaders().append(
                        "Content-Type",
                        "application/json"
                    ),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    DowloandPODDocument(
        HeaderID: number,
        AttachmentID: number
    ): Observable<Blob | string> {
        return this._httpClient
            .get(
                `${this.baseAddress}api/Report/DowloandPODDocument?HeaderID=${HeaderID}&AttachmentID=${AttachmentID}`,
                {
                    responseType: "blob",
                    headers: new HttpHeaders().append(
                        "Content-Type",
                        "application/json"
                    ),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    AddUserManual(selectedFile: File) {
        const formData: FormData = new FormData();
        formData.append(selectedFile.name, selectedFile, selectedFile.name);

        return this._httpClient
            .post<any>(`${this.baseAddress}api/Master/AddUserManual`, formData)
            .pipe(catchError(this.errorHandler));
    }

    GetUserManual() {
        return this._httpClient
            .get(
                `${this.baseAddress}api/Master/GetUserManual`,
                {
                    headers: new HttpHeaders().append(
                        "Content-Type",
                        "application/json"
                    ),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllDCUsers() {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}api/Master/GetAllDCUsers`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllLockedUsers() {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}api/Master/GetAllLockedUsers`
            )
            .pipe(catchError(this.errorHandler));
    }

    UnlockUser(userId: Guid) {
        return this._httpClient
            .get<any>(`${this.baseAddress}api/Master/UnlockUser?UserId=${userId}`,)
            .pipe(catchError(this.errorHandler));
    }
}
