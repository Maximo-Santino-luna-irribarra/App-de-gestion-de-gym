import { PagosService } from './../../../shared/service/pagos.service';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-modal-renovar',
  imports: [ReactiveFormsModule],
  templateUrl: './modal-renovar.html',
  styleUrl: './modal-renovar.css',
})
export class ModalRenovar {
  @Input() miembroId!: string;
  @Input() miembroNombre!: string;
  @Input() usuarioId!: string;

  @Output() cerrar = new EventEmitter<void>();
  @Output() renovado = new EventEmitter<void>();

  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private pagosService: PagosService) {
    const hoy = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      plan: ['mensual', Validators.required],
      monto: [0, Validators.required],
      metodo_pago: ['efectivo'],
      fecha_desde: [hoy, Validators.required],
      fecha_hasta: ['', Validators.required],
      observaciones: ['']
    });
  }

  async guardar() {
    if (this.form.invalid) return;

    this.loading = true;

    try {
      await this.pagosService.registrar({
        miembro_id: this.miembroId,
        usuario_id: this.usuarioId,
        ...this.form.value
      });

      this.renovado.emit();
      this.cerrar.emit();

    } catch (e) {
      console.error(e);
    }

    this.loading = false;
  }





















}
