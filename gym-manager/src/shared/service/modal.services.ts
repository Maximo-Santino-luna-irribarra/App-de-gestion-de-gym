import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    }

    @Injectable({
    providedIn: 'root'
    })
    export class ToastService {

    private toastSubject = new Subject<Toast>();
    toastState$ = this.toastSubject.asObservable();

    show(toast: Toast) {
        this.toastSubject.next({
        duration: 3000,
        type: 'info',
        ...toast
        });
    }

    success(message: string) {
        this.show({ message, type: 'success' });
    }

    error(message: string) {
        this.show({ message, type: 'error' });
    }

    info(message: string) {
        this.show({ message, type: 'info' });
    }
}