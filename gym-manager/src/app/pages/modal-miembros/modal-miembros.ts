import { ToastService } from './../../../shared/service/modal.services';
import { Miembro, MiembrosService } from './../../../shared/service/miembro.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder,
    private miembrosService: MiembrosService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
        ]
      ],
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
        ]
      ],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(7)
        ]
      ],
      email: [
        '',
        [
          Validators.email
        ]
      ],
      telefono: [
        '',
        [
          Validators.pattern(/^\d+$/),
          Validators.minLength(8)
        ]
      ],
      fecha_nacimiento: [
        '',
        [this.noFutureDateValidator]
      ],
      plan: ['Mensual', Validators.required],
      fecha_vencimiento: ['', Validators.required],
      estado: [true],
      pago_al_dia: [false],
    });
  }


  noFutureDateValidator(control: AbstractControl) {
    if (!control.value) return null;

    const fecha = new Date(control.value);
    const hoy = new Date();

    return fecha > hoy ? { futureDate: true } : null;
  }

  onPlanChange() {
    const plan = this.form.get('plan')?.value;

    let dias = 30;
    if (plan === 'Mensual') dias = 30;
    if (plan === 'Trimestral') dias = 90;
    if (plan === 'Anual') dias = 365;

    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);

    this.form.patchValue({
      fecha_vencimiento: fecha.toISOString().split('T')[0]
    });
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarErrores();
      return;
    }

    this.loading = true;

    try {
      const nuevo = await this.miembrosService.crear(this.form.value);

      this.toast.success('Miembro creado correctamente');

      this.guardado.emit(nuevo);
      this.cerrarModal()

    } catch (e: any) {
      console.error(e);
      this.toast.error('Error al guardar miembro');
    } finally {
      this.loading = false;
    }
  }

  private mostrarErrores() {
    const f = this.form.controls;

    if (f['nombre'].errors) {
      this.toast.error('Nombre inválido (mínimo 2 letras)');
      return;
    }

    if (f['apellido'].errors) {
      this.toast.error('Apellido inválido');
      return;
    }

    if (f['dni'].errors) {
      this.toast.error('DNI inválido (mínimo 7 números)');
      return;
    }

    if (f['email'].errors) {
      this.toast.error('Email inválido');
      return;
    }

    if (f['telefono'].errors) {
      this.toast.error('Teléfono inválido (mínimo 8 números)');
      return;
    }

    if (f['fecha_nacimiento'].errors?.['futureDate']) {
      this.toast.error('La fecha de nacimiento no puede ser futura');
      return;
    }

    if (f['fecha_vencimiento'].errors) {
      this.toast.error('Seleccioná una fecha de vencimiento');
      return;
    }

    this.toast.error('Completá los campos obligatorios');
  }
 
 
  cerrarModal(forzado: boolean = false) {
  if (!forzado && this.form.invalid) {
    this.toast.error('Completá el formulario antes de salir');
    return;
  }

  this.cerrar.emit();
}
  tieneError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}