import { Component, OnInit, inject } from '@angular/core';
import {Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { UserSesion } from '../../model/user-sesion';


@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit{
  authService=inject(AuthService);
  sessionService=inject(SessionService);
  router=inject(Router);
  user:UserSesion|null=null;

  ngOnInit(): void {
    this.user=this.sessionService.getInfoSession();
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }



}
