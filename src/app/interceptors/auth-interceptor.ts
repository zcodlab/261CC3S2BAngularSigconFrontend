import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);

  const excludedPaths = [
    '/auth/login',
    '/auth/refresh'
  ];

  const shouldExclude = excludedPaths.some(path =>
    req.url.includes(path)
  );

  if (shouldExclude) {
    return next(req);
  }

  const token = storageService.getToken();

  // Verificacion proactiva: si el token ha caducado, actualicelo antes de enviar la solicitud.
  if (token && storageService.isTokenExpired(token)) {
    return refreshTokenAndRetry(req, next, authService);
  }

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Opcion alternativa: si obtenemos un error 403,
      // intentaremos actualizar la pagina de todos modos (por ejemplo, debido a una desviacion del reloj).
      if (error instanceof HttpErrorResponse && error.status === 403) {
        return refreshTokenAndRetry(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const refreshTokenAndRetry = (request: any, next: any, authService: AuthService): Observable<any> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.token);
        return next(request.clone({
          setHeaders: {
            Authorization: `Bearer ${response.token}`
          }
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        return next(request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        }));
      })
    );
  }
};
