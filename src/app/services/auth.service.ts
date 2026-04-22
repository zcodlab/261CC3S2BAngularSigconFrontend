import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = this._isLoggedIn.asReadonly();

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem('user_token');
  }

  login(email: string, pass: string): boolean {
    if (email === 'dsw@gmail.com' && pass === '123456') {
      localStorage.setItem('user_token', 'mock_token');
      this._isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('user_token');
    this._isLoggedIn.set(false);
  }

}
