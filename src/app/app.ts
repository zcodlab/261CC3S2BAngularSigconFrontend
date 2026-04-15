import { Component, signal } from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterOutlet, RouterLink,RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('261CC3S2BAngularSigconFrontend');

  logout(){

  }
}
