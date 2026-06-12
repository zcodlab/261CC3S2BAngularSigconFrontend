import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { UserRequest } from '../model/api/request/user-request';
import { UserResponse } from '../model/api/response/user-response';
import { Observable, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = this._isLoggedIn.asReadonly();

  login(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.url}/auth/login`, user);
  }

  refreshToken(): Observable<UserResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<UserResponse>(`${environment.url}/auth/refresh`, { refreshToken }).pipe(
      tap((response: UserResponse) => {
        this.setTokens(response.token, response.refreshToken);
      })
    );
  }


  private hasToken(): boolean {
    return !!this.storageService.getToken();
  }

  public setTokens(token: string, refreshToken: string) {
    this.storageService.updateSession(token, refreshToken);
    this._isLoggedIn.set(true);
  }

  // Mantengo setToken por compatibilidad si se usa en otros sitios
  public setToken(token: string) {
    this.storageService.setItem('user_token', token);
    this._isLoggedIn.set(true);
  }

  logout() {
    this.storageService.removeItem('user_token');
    this.storageService.removeCookie('refresh_token');
    this._isLoggedIn.set(false);
  }
}
