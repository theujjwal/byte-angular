import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token()}` });
  }

  get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${environment.apiUrl}${path}`, { headers: this.headers }));
  }

  post<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${environment.apiUrl}${path}`, body, { headers: this.headers }));
  }

  delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${environment.apiUrl}${path}`, { headers: this.headers }));
  }
}
