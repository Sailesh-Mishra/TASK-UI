import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { NotifyService } from '../core/notify.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notify = inject(NotifyService);

  handleError(error: unknown): void {
    console.error(error);                                  // later: send to a logging service
    if (error instanceof HttpErrorResponse) return;        // the interceptor already told the user
    this.notify.error('Something went wrong. Please refresh and try again.');
  }
}