import { Component, OnInit, SecurityContext } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FileUploader } from "ng2-file-upload";
import { MasterService } from "app/services/master.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { AuthenticationDetails } from "app/models/master";

@Component({
    selector: "app-user-manual",
    templateUrl: "./user-manual.component.html",
    styleUrls: ["./user-manual.component.scss"],
})
export class UserManualComponent implements OnInit {
    selectedFile: File = null;
    videoUrl: any;
    pdfSrc: string = null;
    temp: any;
    fileName: string;
    videofileName : string;
    pdfUrl: any;
    // pdfurl: any;
    IsProgressBarVisibile: boolean;
    authenticationDetails: AuthenticationDetails;
    constructor(
        private _http: HttpClient,
        private _masterService: MasterService,
        private sanitizer: DomSanitizer,
        private _router: Router
    ) {
        this.IsProgressBarVisibile = true;
    }

    ngOnInit() {
        const retrievedObject = sessionStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.openview();
        }
    }

    onFileSelect(event, f) {
        if (event != null) {
            this.fileName = event.target.files[0].name;
            this.selectedFile = event.target.files[0];
            this.temp = f;
            this.videoUrl = null;
            this.pdfUrl = null;
            if (this.temp == "pdf") {
                this.fileInput();
            } else {
                this.fileInputs();
            }
        }
    }

    fileInput() {
        var formdata = new FormData();
        formdata.append(
            this.selectedFile.name,
            this.selectedFile,
            this.selectedFile.name
        );
        this.IsProgressBarVisibile = true;
        this._masterService.AddUserManual(this.selectedFile).subscribe(
            (UserManualDocId) => {
                this.openview();
            },
            (error) => {
                console.log(error);
            }
        );
    }

    fileInputs() {
        var formdata = new FormData();
        formdata.append(
            this.selectedFile.name,
            this.selectedFile,
            this.selectedFile.name
        );
        this._masterService.AddUserManual(this.selectedFile).subscribe(
            (UserManualDocId) => {
                this.openview();
            },
            (error) => {
                console.log(error);
            }
        );
    }

    openview() {
        this.IsProgressBarVisibile = true;
        this._masterService.GetUserManual().subscribe({
            next:(response) => {
                
                response.forEach(async element => {                 
                    await this.getAttachmentData(element)
                     .then((data) =>{
                        if(element.FileType.toLowerCase().includes("pdf")){
                            this.fileName = element.FileName;
                            this.pdfUrl = data;
                        }
                        else{
                            this.videofileName = element.FileName;
                            this.videoUrl = data;
                        }
                     })
                     .catch((err) => {
                            console.log(err);
                     });
                });
               
            },
        });
        this.IsProgressBarVisibile = false;
    }

    createBlob(fileContent: string, fileExtention: string): Promise<any> {
        return new Promise((resolve) => {
            // let bytes = new Uint8Array(fileContent.length);

            // for (let i = 0; i < bytes.length; i++) {
            //     bytes[i] = fileContent.charCodeAt(i);
            // }
            // let blob = new Blob([bytes], {
            //     type: fileExtention,
            // });
            const BASE64 = `data:${fileExtention};base64,` + fileContent;
            resolve(BASE64);
        });
    }

    dataURItoBlob(dataURI: string): Blob {
        // convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        if (dataURI.split(",")[0].indexOf("base64") >= 0) {
            byteString = atob(dataURI.split(",")[1]);
        } else {
            byteString = unescape(dataURI.split(",")[1]);
        }

        // separate out the mime component
        const MIMESTRING = dataURI.split(",")[0].split(":")[1].split(";")[0];
        // write the bytes of the string to a typed array
        const IA = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            IA[i] = byteString.charCodeAt(i);
        }

        return new Blob([IA], { type: MIMESTRING });
    }

    async getAttachmentData(res) {
        const BASE64STRING = await this.createBlob(
            res.FileContent,
            res.FileType
        );
        const BLOB = this.dataURItoBlob(BASE64STRING);

        //const fileURL = URL.createObjectURL(
        //  new File([BLOB], res.AttachmentName)
        //);
        //const BLOB = await this.createBlob(res.FileContent, res.FileType);
        const fileURL = URL.createObjectURL(BLOB);
      //  return this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      if(res.FileType == "application/pdf"){
        return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(fileURL));
      }
      else{
           return this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      }
    }
}
