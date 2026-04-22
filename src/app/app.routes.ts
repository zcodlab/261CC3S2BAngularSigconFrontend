import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';

export const routes: Routes = [
  { path:'',component:Home},
  { path: 'login', component: InicioSesion},
];
