import { PagosService } from './../../../shared/service/pagos.service';
import { Component, Input, Output, EventEmitter,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-modal-renovar',
  imports: [ReactiveFormsModule],
  templateUrl: './modal-renovar.html',
  styleUrl: './modal-renovar.css',
})
export class ModalRenovar implements OnInit {
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
  ngOnInit() {
    this.form.get('plan')?.valueChanges.subscribe(() => {
      this.calcularFecha();
    });

    this.form.get('fecha_desde')?.valueChanges.subscribe(() => {
      this.calcularFecha();
    });

    this.calcularFecha();
  }

    calcularFecha() {
      const plan = this.form.get('plan')?.value;
      const fechaDesde = this.form.get('fecha_desde')?.value;

      if (!plan || !fechaDesde) return;

      const desde = new Date(fechaDesde);
      let hasta = new Date(desde);

      switch (plan) {
        case 'mensual':
          hasta.setMonth(hasta.getMonth() + 1);
          break;
        case 'trimestral':
          hasta.setMonth(hasta.getMonth() + 3);
          break;
        case 'anual':
          hasta.setFullYear(hasta.getFullYear() + 1);
          break;
      }

      const fechaFinal = hasta.toISOString().split('T')[0];

      this.form.get('fecha_hasta')?.setValue(fechaFinal, { emitEvent: false });
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
