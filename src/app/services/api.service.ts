import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { SKIP_LOADER } from '../core/interceptors/loader.interceptor';

export interface ApiOptions {
  skipLoader?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token()}` });
  }

  private buildContext(opts?: ApiOptions): HttpContext {
    const ctx = new HttpContext();
    if (opts?.skipLoader) ctx.set(SKIP_LOADER, true);
    return ctx;
  }

  get<T>(path: string, opts?: ApiOptions): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${environment.apiUrl}${path}`, { headers: this.headers, context: this.buildContext(opts) }));
  }

  post<T>(path: string, body: any, opts?: ApiOptions): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${environment.apiUrl}${path}`, body, { headers: this.headers, context: this.buildContext(opts) }));
  }

  delete<T>(path: string, opts?: ApiOptions): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${environment.apiUrl}${path}`, { headers: this.headers, context: this.buildContext(opts) }));
  }
}
