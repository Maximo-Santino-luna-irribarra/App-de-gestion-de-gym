import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  form = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
  }

  constructor(private router: Router) {}

  onRegistrar() {
    console.log(this.form);
    // Acá después conectás con Supabase
  }
}