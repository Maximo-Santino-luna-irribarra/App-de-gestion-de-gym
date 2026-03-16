import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  
})
export class Login {
  
  email = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    // Acá después conectás con Supabase Auth
    console.log(this.email, this.password);
  }
}
