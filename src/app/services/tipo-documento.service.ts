import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { TipoDocumento } from '../model/tipo-documento';

@Injectable({
  providedIn: 'root',
})
export class TipoDocumentoService {
  private http=inject(HttpClient)

  getTipoDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${environment.url}/tipodocumento`);
  }
}
