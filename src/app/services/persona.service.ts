import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PersonaRequest } from '../model/api/request/persona-request';
import { PersonaResponse } from '../model/api/response/persona-response';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  constructor(private http: HttpClient) {}

  getPersonas(): Observable<PersonaResponse[]> {
    return this.http.get<PersonaResponse[]>(`${environment.url}/persona`);
  }

  registrarPersona(persona: PersonaRequest): Observable<PersonaResponse> {
    console.log(persona);
    return this.http.post<PersonaResponse>(`${environment.url}/persona`, persona);
  }

  eliminarPersona(persona: PersonaRequest): Observable<PersonaResponse> {
    return this.http.delete<PersonaResponse>(`${environment.url}/persona`, {
      body: persona,
    });
  }

  actualizarPersona(persona: PersonaRequest): Observable<PersonaResponse> {
    return this.http.put<PersonaResponse>(`${environment.url}/persona`, persona);
  }
}
