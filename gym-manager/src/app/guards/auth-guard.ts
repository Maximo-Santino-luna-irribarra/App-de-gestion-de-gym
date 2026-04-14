import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/service/supabase.service';
import { ToastService } from './../../shared/service/modal.services';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toast: ToastService,
  ) {}

  async canActivate(): Promise<boolean> {
    const { data } = await this.supabase.client.auth.getUser();

    if (data.user) {
      return true; // está logueado
    } else {
      this.router.navigate(['/auth']); // lo manda al login
      this.toast.error("Error debe de iniciar sesio")
      return false;
    }
  }
}