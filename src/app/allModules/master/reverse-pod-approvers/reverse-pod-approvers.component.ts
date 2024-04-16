import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserWithRole } from 'app/models/master';
import { MasterService } from 'app/services/master.service';
import { ReversePodService } from 'app/services/reverse-pod.service';

@Component({
  selector: 'app-reverse-pod-approvers',
  templateUrl: './reverse-pod-approvers.component.html',
  styleUrls: ['./reverse-pod-approvers.component.scss']
})
export class ReversePodApproversComponent implements OnInit {

  approvers: FormControl = new FormControl();
  AllUsers: UserWithRole[] = [];
  constructor(private _master: MasterService, private _reversePod: ReversePodService) { }

  ngOnInit() {
    this.getAllDcUsers();
  }

  getAllDcUsers() {
    this._master.GetAllDCUsers().subscribe({
      next: (data) => {
        this.AllUsers = <UserWithRole[]>data;
        this.getDcApprovers();
      },
      error: (err) => {

      }
    })
  }

  getDcApprovers() {
    this._reversePod.GetDcApprovers().subscribe({
      next: (res) => {
        if (res)
          this.approvers.patchValue(res);
      }
    })
  }

  Update() {
    this._reversePod.UpdateReversePodApprover(this.approvers.value).subscribe({
      next:(res)=>{
        console.log("Updated");
      }
    })
  }
}
