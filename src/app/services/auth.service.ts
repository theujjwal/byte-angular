import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../core/models';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _token    = signal<string | null>(localStorage.getItem('byte_token'));
  private _user     = signal<User | null>(this.loadSavedUser());
  private _loading  = signal(false);
  private _error    = signal<string | null>(null);

  readonly token    = this._token.asReadonly();
  readonly user     = this._user.asReadonly();
  readonly loading  = this._loading.asReadonly();
  readonly error    = this._error.asReadonly();
  readonly isAuthed = computed(() => !!this._token());

  private loadSavedUser(): User | null {
    const saved = localStorage.getItem('byte_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  }

  initGoogleAuth(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (r: any) => this.handleIdToken(r.credential),
      auto_select: false,
    });
  }

  signInWithPopup(): void {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: environment.googleClientId,
      scope: 'openid email profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) { this._error.set('OAuth error: ' + tokenResponse.error); return; }
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
          });
          const info = await res.json();
          await this.handleOAuthToken(tokenResponse.access_token, info);
        } catch (e: any) { this._error.set(e.message); }
      }
    });
    client.requestAccessToken({ prompt: 'select_account' });
  }

  private async handleIdToken(idToken: string): Promise<void> {
    this._loading.set(true);
    try {
      const data = await this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { token: idToken }).toPromise();
      if (data) this.saveAuth(data.token, data.user);
    } catch (e: any) {
      this._error.set('Sign-in failed: ' + e.message);
    } finally { this._loading.set(false); }
  }

  async handleOAuthToken(accessToken: string, userInfo: any): Promise<AuthResponse | null> {
    this._loading.set(true);
    try {
      const data = await this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google-oauth`, {
        access_token: accessToken,
        google_id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name || userInfo.email,
        picture: userInfo.picture || '',
      }).toPromise();
      if (data) {
        this.saveAuth(data.token, data.user);
        this.router.navigate(['/chat']);
        return data;
      }
      return null;
    } catch (e: any) {
      this._error.set('Sign-in failed: ' + e.message);
      return null;
    } finally { this._loading.set(false); }
  }

  async restoreSession(): Promise<AuthResponse | null> {
    const token = this._token();
    const savedUser = this._user();
    if (!token) return null;
    try {
      const endpoint = savedUser ? `${environment.apiUrl}/auth/google-oauth` : `${environment.apiUrl}/auth/google`;
      const body = savedUser
        ? { access_token: token, google_id: savedUser.google_id || '', email: savedUser.email, name: savedUser.name, picture: savedUser.picture }
        : { token };
      const data = await this.http.post<AuthResponse>(endpoint, body).toPromise();
      if (data) { this.saveAuth(data.token, data.user); return data; }
      return null;
    } catch {
      this._token.set(null);
      this._user.set(null);
      localStorage.removeItem('byte_token');
      localStorage.removeItem('byte_user');
      return null;
    }
  }

  private saveAuth(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('byte_token', token);
    localStorage.setItem('byte_user', JSON.stringify(user));
    this.scheduleAutoLogout(token);
  }

  signOut(): void {
    if (this._logoutTimer) { clearTimeout(this._logoutTimer); this._logoutTimer = null; }
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('byte_token');
    localStorage.removeItem('byte_user');
    this.router.navigate(['/login']);
  }

  clearError(): void { this._error.set(null); }

  private _logoutTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleAutoLogout(token: string): void {
    if (this._logoutTimer) clearTimeout(this._logoutTimer);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return;
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      // Log out 30s before expiry to avoid mid-request failures
      const delay = Math.max(msUntilExpiry - 30_000, 0);
      this._logoutTimer = setTimeout(() => this.signOut(), delay);
    } catch { /* malformed token — interceptor will catch 401 */ }
  }
}
