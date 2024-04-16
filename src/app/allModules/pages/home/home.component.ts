import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
  }

  navigate(prmtr: string) {
    if (prmtr == "1") {
      this._router.navigate(["pages/forwardLogistics"])
    }
    if (prmtr == "2") {
      this._router.navigate(["pages/reverseLogistics"])
    }
  }
}
