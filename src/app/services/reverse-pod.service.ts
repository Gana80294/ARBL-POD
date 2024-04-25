import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
    ReversePODFilter,
    ReversePodApprover,
    ReversePodUpdation,
    UpdateReverseLogistics,
} from "app/models/invoice-details";
import { environment } from "environments/environment";
import { Guid } from "guid-typescript";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class ReversePodService {
    baseAddress: string;
    constructor(private _httpClient: HttpClient) {
        this.baseAddress = environment.baseAddress;
    }

    errorHandler(error: HttpErrorResponse): Observable<string> {
        // console.log(error);
        // var message = "";
        // if (error.error instanceof Object) {
        //     if (error.error.errors && error.error.errors instanceof Object) {
        //         Object.keys(error.error.errors).forEach((key) => {
        //             message += error.error.errors[key][0] + "\n";
        //         });
        //     } else {
        //         message =
        //             error.error instanceof Object
        //                 ? error.error.Error
        //                     ? error.error.Error
        //                     : error.error.ExceptionMessage
        //                     ? error.error.ExceptionMessage
        //                     : error.error.Message
        //                     ? error.error.Message
        //                     : error.error.message
        //                 : error.error || error.message || "Server Error";
        //     }
        // }
        // console.log(message);
        // if (message) throwError(message);
        // else
        return throwError(error.error || error.message || "Server Error");
    }

    ConfirmInvoiceItems(formData: FormData): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/ConfirmReversePod`,
                formData
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterAllReversePODs(filterClass: ReversePODFilter): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/FilterReversePODDetails`,
                filterClass
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterAllOpenReversePODs(filterClass: ReversePODFilter): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/FilterAllOpenReversePODs`,
                filterClass
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterAllInTransitReversePODs(
        filterClass: ReversePODFilter
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/FilterAllInTransitReversePODs`,
                filterClass
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterAllPartiallyConfirmedReversePODs(
        filterClass: ReversePODFilter
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/FilterAllPartiallyConfirmedReversePODs`,
                filterClass
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterAllConfirmedReversePODs(
        filterClass: ReversePODFilter
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/FilterAllConfirmedReversePODs`,
                filterClass
            )
            .pipe(catchError(this.errorHandler));
    }

    DownloadRPODDocument(AttachmentID: number): Observable<Blob | string> {
        return this._httpClient
            .get(
                `${this.baseAddress}api/ReversePOD/DownloadRPODDocument?AttachmentID=${AttachmentID}`,
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

    DownloadRpodReport(filterClass: ReversePODFilter): Observable<Blob | string> {
        return this._httpClient.post(
            `${this.baseAddress}api/ReversePOD/DownloadRPODReport`, filterClass,
            {
                responseType: 'blob',
                headers: new HttpHeaders().append('Content-Type', 'application/json')
            })
            .pipe(catchError(this.errorHandler));
    }

    UpdateReversePodApprover(approver: Guid[]): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/UpdateReversePodApprover`,
                approver
            )
            .pipe(catchError(this.errorHandler));
    }

    GetIsApprover(UserId: Guid) {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}api/ReversePOD/GetIsApprover?UserId=${UserId}`,
            )
            .pipe(catchError(this.errorHandler));
    }

    GetDcApprovers() {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}api/ReversePOD/GetDcApprovers`,
            )
            .pipe(catchError(this.errorHandler));
    }

    ConfirmReversePodQty(payLoad: ReversePodUpdation) {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/ConfirmReversePodQty`,
                payLoad
            )
            .pipe(catchError(this.errorHandler));
    }

    ReUploadReversePodLr(formData: FormData): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/ReUploadReversePodLr`,
                formData
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateReversePodAsAdmin(payLoad: UpdateReverseLogistics) {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/ReversePOD/UpdateReversePodAsAdmin`,
                payLoad
            )
            .pipe(catchError(this.errorHandler));
    }

    confirmReversePod(formData: FormData): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}api/ReversePOD/ConfirmReversePod`, formData
        )
            .pipe(catchError(this.errorHandler));
    }

    confirmReversePodDirectly(formData: FormData): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}api/ReversePOD/ConfirmReversePodDirectly`, formData
        )
            .pipe(catchError(this.errorHandler));
    }
}
