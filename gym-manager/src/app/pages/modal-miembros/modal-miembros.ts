import { Miembro, MiembrosService } from './../../../shared/service/miembro.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-miembro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modal-miembros.html',
})
export class ModalMiembro {

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<Miembro>();

  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private miembrosService: MiembrosService
  ) {
    this.form = this.fb.group({
      nombre:            ['', Validators.required],
      apellido:          ['', Validators.required],
      dni:               ['', Validators.required],
      email:             ['', Validators.email],
      telefono:          [''],
      fecha_nacimiento:  [''],
      plan:              ['Mensual', Validators.required],
      fecha_vencimiento: ['', Validators.required],
      estado:            [true],
      pago_al_dia:       [false],
    });
  }

  // Calcula el vencimiento automáticamente según el plan
  onPlanChange() {
    const plan = this.form.get('plan')?.value;
    const dias = plan === 'Mensual' ? 30 : plan === 'Trimestral' ? 90 : 365;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    this.form.patchValue({
      fecha_vencimiento: fecha.toISOString().split('T')[0]
    });
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const nuevo = await this.miembrosService.crear(this.form.value);
      this.guardado.emit(nuevo);
      this.cerrar.emit();
    } catch (e: any) {
      this.error = e.message ?? 'Error al guardar';
    } finally {
      this.loading = false;
    }
  }

  // Helper para mostrar errores en el template
  tieneError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}