import { Component, signal } from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterOutlet} from '@angular/router';
import { Footer } from "./components/footer/footer";
import { Header } from "./components/header/header";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Footer, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('261CC3S2BAngularSigconFrontend');

  logout(){

  }
}
