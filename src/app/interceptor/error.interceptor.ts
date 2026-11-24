import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { NotifyService } from '../core/notify.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotifyService);

  const isAuthCall = req.url.endsWith('/login') || req.url.endsWith('/refresh');

  const endSession = () => {
    auth.clearToken();
    router.navigate(['/login']);
  };

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthCall) {
        if (!auth.token) {
          endSession();
          return throwError(() => err);
        }
        // try once to get a fresh token, then repeat the original request with it
        return auth.refresh().pipe(
          catchError((refreshErr) => {
            endSession();
            return throwError(() => refreshErr);
          }),
          switchMap((token) =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
          ),
        );
      }

      if (err.status === 0) {
        notify.error('Cannot reach the server. Check your connection.');
      } else if (err.status === 403) {
        notify.error('You are not allowed to do this.');
      } else if (err.status === 404) {
        notify.error('Not found.');
      } else if (err.status === 429) {
        notify.error('Too many attempts. Please wait a moment and try again.');
      } else if (err.status >= 500) {
        notify.error('Server error. Please try again later.');
      }
      return throwError(() => err);
    }),
  );
};
