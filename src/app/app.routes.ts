import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Dashboard } from './components/dashboard/dashboard';
import { RegistrarPersona } from './components/gestion-mantenimiento/registrar-persona/registrar-persona';


export const routes: Routes = [
  { path:'',component:Home},
  { path: 'login', component: InicioSesion},
  { path: 'dashboard', component: Dashboard,children:[
      { path: 'RegistrarPersona', component: RegistrarPersona},
  ]},
  { path: '**', redirectTo:''},

];
