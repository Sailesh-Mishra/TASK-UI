import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap, catchError, map, finalize, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment.development';

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly TOKEN_KEY = 'access_token';
  private refresh$: Observable<string> | null = null;

  login(credential: { email: string, password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, credential)
      .pipe(tap((res: any) => localStorage.setItem(this.TOKEN_KEY, res.access_token)));
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  logout(): Observable<unknown> {
    // tell Laravel to blacklist the token; clear it locally even if that call fails
    return this.http.post(`${environment.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this.clearToken()),
    );
  }

  refresh(): Observable<string> {
    if (!this.refresh$) {
      this.refresh$ = this.http
        .post<LoginResponse>(`${environment.apiUrl}/refresh`, {})
        .pipe(
          tap((res) => localStorage.setItem(this.TOKEN_KEY, res.access_token)),
          map((res) => res.access_token),
          finalize(() => (this.refresh$ = null)),
          shareReplay(1),
        );
    }
    return this.refresh$;
  }
}
