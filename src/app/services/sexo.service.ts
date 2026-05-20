import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Sexo } from '../model/sexo';

@Injectable({
  providedIn: 'root',
})
export class SexoService {
  private http=inject(HttpClient)

    getSexo(): Observable<Sexo[]> {
      return this.http.get<Sexo[]>(`${environment.url}/sexo`);
    }

}
