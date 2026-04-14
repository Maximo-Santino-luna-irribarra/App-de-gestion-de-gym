import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/service/auth.service';
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  
})
export class Login {
  
    email = '';
    password = '';
    error = '';
    loading = false;

  constructor(private router: Router,
        private auth: AuthService,
  ) {}

  
  async onLogin() {
      this.loading = true;
      this.error = '';

      try {
        await this.auth.login(this.email, this.password);
        this.router.navigate(['/home']);
      } catch (e: any) {
        this.error = 'Email o contraseña incorrectos';
      } finally {
        this.loading = false;
      }
    }
    async accesoRapido() {
      this.email = 'qwerty@gmail.com';
      this.password = 'qwerty';

      await this.onLogin();
    }
    
}
