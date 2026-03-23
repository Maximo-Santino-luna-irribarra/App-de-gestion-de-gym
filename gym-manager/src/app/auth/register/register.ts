import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import{ AuthService } from './../../../shared/service/auth.service'


interface RegisterForm {
  email: string;
  password: string;
  nombre: string;
  dni: string;
  telefono: string;
}


@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})


export class Register {
  form: RegisterForm = this.getEmptyForm();
  loading = false;
  error: string | null = null;

  constructor(private router: Router,
    private auth: AuthService,
  ) {}

    private getEmptyForm(): RegisterForm {
    return {
      nombre: '',
      dni: '',
      telefono: '',
      email: '',
      password: '',
    };
}
    async onRegistrar() {
      this.error = null;

      if (!this.isValid()) {
        this.error = 'Completá bien los campos';
        return;
      }

      try {
        this.loading = true;

        console.log(this.form);


        await this.auth.register(this.form)
        this.resetForm();
        this.router.navigate(['/login']); // redirige después de registrar
      } catch (err) {
        console.error(err);
        this.error = 'Error al registrar';
      } finally {
        this.loading = false;
      }
  }
    private isValid(): boolean {
    return !!(
      this.form.nombre &&
      this.form.email &&
      this.form.password &&
      this.form.dni
    );
  }

  private resetForm() {
    this.form = this.getEmptyForm();
  }
}