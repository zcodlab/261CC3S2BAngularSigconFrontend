import { Injectable } from '@angular/core';
import { UserSesion } from '../model/user-sesion';
import { Rol } from '../model/rol';
import { Modulo } from '../model/modulo';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private getDecodedToken():any|null{
    const token = localStorage.getItem('user_token');
    if (token) {
      const decodedTokenString=atob(token.split('.')[1]);
      return JSON.parse(decodedTokenString);
    };
    return null;
  }

  getInfoSession(): UserSesion | null{
    const decodedToken=this.getDecodedToken();
    if(!decodedToken){
      return null;
    }
    return {
      email:decodedToken.email,
      personaId:decodedToken.personaId,
      names:decodedToken.names,
      rol:decodedToken.role,
      modulos:decodedToken.modules
    }

  }


}
