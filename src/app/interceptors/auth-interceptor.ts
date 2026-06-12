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
    //verifica si req contiene alguna de la rutas que no requieren token
    req.url.includes(path)
  );
  //si req incluye una ruta de la lista de rutas excluidas
  if (shouldExclude) {
    //continua con la ejecucion del request
    return next(req);
  }

  //recupera el token
  const token = storageService.getToken();

  // Verificacion proactiva: si el token ha caducado, actualicelo antes de enviar la solicitud.
  if (token && storageService.isTokenExpired(token)) {
    return refreshTokenAndRetry(req, next, authService);
  }
  //declara un nuevo objeto request, debido a que req es inmutable
  let authReq = req;
  //si se cuenta con token vigente, clona el request para incorporar el token en el header de la peticion http
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  //continua con la ejecucion http que fue interceptada y captura la respuesta
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
        //comunica a sus suscriptores del nuevo token
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
      take(1),  //toma el primer token y luego se desuscribe
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
