import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../services/auth.service';
import { vi } from 'vitest';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let signOutSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    signOutSpy = vi.fn();

    const mockAuthService = {
      token: () => 'fake-jwt-token',
      signOut: signOutSpy,
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should attach Authorization header to requests', () => {
    http.get('/api/test').subscribe();
    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    req.flush({});
  });

  it('should NOT attach Authorization header for googleapis.com', () => {
    http.get('https://www.googleapis.com/oauth2/v3/userinfo').subscribe();
    const req = httpTesting.expectOne('https://www.googleapis.com/oauth2/v3/userinfo');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should call signOut on 401 response', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    const req = httpTesting.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(signOutSpy).toHaveBeenCalledTimes(1);
  });

  it('should NOT call signOut on 403 response', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    const req = httpTesting.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(signOutSpy).not.toHaveBeenCalled();
  });

  it('should NOT call signOut on 500 response', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    const req = httpTesting.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    expect(signOutSpy).not.toHaveBeenCalled();
  });
});
