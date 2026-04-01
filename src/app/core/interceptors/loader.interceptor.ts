import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

const SKIP_LOADER = ['/chat', '/chats/', '/profile'];

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (SKIP_LOADER.some(path => req.url.includes(path))) {
    return next(req);
  }
  const loader = inject(LoaderService);
  loader.show();
  return next(req).pipe(finalize(() => loader.hide()));
};
