import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    //
  }

  logout() {
    this.authService.logout();
    localStorage.clear();
  }
}
