import { Component,OnInit } from '@angular/core';
import { ToastService,Toast } from '../service/modal.services';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-toast',
  imports: [NgClass,CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent implements OnInit {

  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastState$.subscribe((toast) => {
      this.toasts.push(toast);

      setTimeout(() => {
        this.toasts.shift();
      }, toast.duration);
    });
  }

  remove(index: number) {
    this.toasts.splice(index, 1);
  }
}