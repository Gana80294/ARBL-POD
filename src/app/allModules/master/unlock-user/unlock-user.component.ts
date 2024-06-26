import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { MasterService } from 'app/services/master.service';

@Component({
  selector: 'app-unlock-user',
  templateUrl: './unlock-user.component.html',
  styleUrls: ['./unlock-user.component.scss']
})
export class UnlockUserComponent implements OnInit {

  displayedColumns: string[] = [
    "UserName",
    "UserCode",
    "Email",
    "Action",
  ];
  dataSource = new MatTableDataSource<UserWithRole>([]);

  pageSize: number = 5;
  pageIndex: number = 0;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  IsProgressBarVisibile: boolean = false;
  constructor(
    private _master: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit() {
    this.getAllLockedUsers();
  }

  getAllLockedUsers() {
    this.IsProgressBarVisibile = true;
    this._master.GetAllLockedUsers().subscribe({
      next: (data) => {
        this.IsProgressBarVisibile = false;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        this.IsProgressBarVisibile = false;
      }
    })
  }

  unlockUser(data) {
    this.IsProgressBarVisibile = true;
    this._master.UnlockUser(data.UserID).subscribe({
      next: (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar("User unlocked successfully", SnackBarStatus.success);
        this.getAllLockedUsers();
      },
      error: (err) => {
        this.IsProgressBarVisibile = false;
      }
    })
  }

  pageSelect(event) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getActuaIndex(ind: number) {
    return (this.pageIndex * this.pageSize) + ind;
  }
}
