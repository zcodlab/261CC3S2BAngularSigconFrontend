import { Injectable,signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { UserRequest } from '../model/api/request/user-request';
import { UserResponse } from '../model/api/response/user-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(private http: HttpClient) {}

  login(user:UserRequest): Observable<UserResponse> {
      return this.http.post<UserResponse>(`${environment.url}/auth/login`, user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('user_token');
  }

  public setToken(token: string) {
    localStorage.setItem('user_token', token);
    this._isLoggedIn.set(true);
  }

  logout() {
    localStorage.removeItem('user_token');
    this._isLoggedIn.set(false);
  }

}
