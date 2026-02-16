import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  activeRequests++;
  
  if (activeRequests === 1) {
    document.body.classList.add('loading');
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        document.body.classList.remove('loading');
      }
    })
  );
};
