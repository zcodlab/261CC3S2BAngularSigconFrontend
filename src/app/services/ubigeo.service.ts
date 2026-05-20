import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Ubigeo } from '../model/ubigeo';

@Injectable({
  providedIn: 'root',
})
export class UbigeoService {
  private http=inject(HttpClient)

  getUbigeo(): Observable<Ubigeo[]> {
    return this.http.get<Ubigeo[]>(`${environment.url}/ubigeo`);
  }
}
