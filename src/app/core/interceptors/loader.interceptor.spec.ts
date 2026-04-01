import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loaderInterceptor, SKIP_LOADER } from './loader.interceptor';
import { LoaderService } from '../../services/loader.service';

describe('loaderInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let loader: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loaderInterceptor])),
        provideHttpClientTesting(),
        LoaderService,
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loader = TestBed.inject(LoaderService);
  });

  afterEach(() => httpTesting.verify());

  it('should show loader for normal requests', () => {
    http.get('/api/dashboard').subscribe();
    expect(loader.visible()).toBe(true);
    httpTesting.expectOne('/api/dashboard').flush({});
    expect(loader.visible()).toBe(false);
  });

  it('should skip loader when SKIP_LOADER context token is set', () => {
    const ctx = new HttpContext().set(SKIP_LOADER, true);
    http.get('/api/chat', { context: ctx }).subscribe();
    expect(loader.visible()).toBe(false);
    httpTesting.expectOne('/api/chat').flush({});
    expect(loader.visible()).toBe(false);
  });

  it('should show loader when SKIP_LOADER is not set', () => {
    http.get('/api/chat').subscribe();
    expect(loader.visible()).toBe(true);
    httpTesting.expectOne('/api/chat').flush({});
  });

  it('should hide loader even if request fails', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    expect(loader.visible()).toBe(true);
    httpTesting.expectOne('/api/test').flush('err', { status: 500, statusText: 'Error' });
    expect(loader.visible()).toBe(false);
  });
});
