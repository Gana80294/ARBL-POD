import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AttachmentResponse } from "app/models/invoice-details";
import { saveAs } from "file-saver";

@Injectable({
    providedIn: "root",
})
export class FileSaverService {
    FileName: string;
    FILE: any;

    constructor(private sanitizer: DomSanitizer) {}

    createBlob(
        fileName: string,
        fileContent: string,
        fileExtention: string
    ): Promise<any> {
        return new Promise((resolve) => {
            const FILETYPE = fileName.toLowerCase().includes("pdf")
                ? "application/pdf"
                : fileName.toLowerCase().includes("xml")
                ? "application/xml"
                : fileName.toLowerCase().includes("csv")
                ? "text/csv"
                : fileName.toLowerCase().includes("png")
                ? "image/png"
                : "text/plain";
            const BASE64 = `data:${FILETYPE};base64,` + fileContent;
            resolve(BASE64);
        });
    }

    createBlobFile(fileName: string, fileContent: string) {
        const FILETYPE = fileName.toLowerCase().includes("pdf")
            ? "application/pdf"
            : fileName.toLowerCase().includes("xml")
            ? "application/xml"
            : fileName.toLowerCase().includes("csv")
            ? "text/csv"
            : fileName.toLowerCase().includes("png")
            ? "image/png"
            : "text/plain";
        const BASE64 = `data:${FILETYPE};base64,` + fileContent;
        return BASE64;
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

    dataURItoUnit8Array(dataURI: string) {
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

        return IA.buffer;
    }

    async downloadFile(res: AttachmentResponse): Promise<void> {
        await this.getAttachmentData(res);
        saveAs(this.FILE, this.FileName);
    }

    getBlobData(res: AttachmentResponse) {
        this.FileName = res.FileName;
        const BASE64 = this.createBlobFile(
            res.FileName,
            res.FileContent
        );
        const BLOB = this.dataURItoBlob(BASE64);
        return BLOB;
    }

    async getAttachmentData(res: AttachmentResponse) {
        this.FileName = res.FileName;
        const BASE64 = await this.createBlob(
            res.FileName,
            res.FileContent,
            res.Extension
        );
        const BLOB = this.dataURItoBlob(BASE64);
        this.FILE = new File([BLOB], res.FileName);
        const fileURL = URL.createObjectURL(this.FILE);
        return this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    }

    downloadBlob(blob: Blob, filename: string) {
        saveAs(blob, filename);
    }
}
