import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagosService, Pago } from '../../../shared/service/pagos.service';
import { MiembrosService, Miembro } from '../../../shared/service/miembro.service';
import { AuthService } from '../../../shared/service/auth.service';
import { ToastService } from '../../../shared/service/modal.services';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  pagos: Pago[] = [];
  miembros: Miembro[] = [];

  loading = false;
  guardando = false;
  error = '';

  busqueda = '';
  fechaDesdeFiltro = '';
  fechaHastaFiltro = '';

  ordenCampo: 'created_at' | 'fecha_pago' | 'fecha_desde' | 'fecha_hasta' = 'created_at';
  ordenAsc = false;

  modalAbierto = false;

  form = this.getEmptyForm();

  constructor(
    private pagosService: PagosService,
    private miembrosService: MiembrosService,
    private authService: AuthService,
    private toast: ToastService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarTodo();
    this.cd.detectChanges();
  }

  getEmptyForm() {
    const hoy = new Date().toISOString().split('T')[0];

    return {
      miembro_id: '',
      monto: null as number | null,
      plan: 'mensual',
      fecha_pago: hoy,
      metodo_pago: 'efectivo',
      fecha_desde: hoy,
      fecha_hasta: hoy,
      observaciones: '',
    };
  }

  async cargarTodo() {
    this.loading = true;
    this.error = '';

    try {
      this.miembros = await this.miembrosService.getAll();
      this.pagos = await this.pagosService.getAll(this.ordenCampo, this.ordenAsc);
    } catch (e: any) {
      console.error(e);
      this.error = 'Error al cargar pagos';
      this.toast.error('Error al cargar pagos');
    } finally {
      this.loading = false;
    }
  }

  async cargarPagos() {
    this.loading = true;
    this.error = '';

    try {
      this.pagos = await this.pagosService.getAll(this.ordenCampo, this.ordenAsc);
    } catch (e: any) {
      console.error(e);
      this.error = 'Error al cargar pagos';
      this.toast.error('Error al cargar pagos');
    } finally {
      this.loading = false;
    }
  }

  abrirModal() {
    this.form = this.getEmptyForm();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  calcularFechaHasta() {
    if (!this.form.fecha_desde) return;

    const desde = new Date(this.form.fecha_desde);

    let dias = 30;

    if (this.form.plan === 'semanal') dias = 7;
    if (this.form.plan === 'quincenal') dias = 15;
    if (this.form.plan === 'mensual') dias = 30;
    if (this.form.plan === 'trimestral') dias = 90;
    if (this.form.plan === 'anual') dias = 365;

    desde.setDate(desde.getDate() + dias);
    this.form.fecha_hasta = desde.toISOString().split('T')[0];
  }

  async guardarPago() {
    this.error = '';

    if (!this.form.miembro_id || !this.form.monto || this.form.monto <= 0) {
      this.error = 'Completá bien los datos';
      return;
    }

    try {
      this.guardando = true;

      const session = await this.authService.getSession();
      const usuarioId = session?.user?.id;

      if (!usuarioId) {
        throw new Error('No hay usuario logueado');
      }

      await this.pagosService.registrar({
        miembro_id: this.form.miembro_id,
        usuario_id: usuarioId,
        monto: Number(this.form.monto),
        plan: this.form.plan,
        fecha_pago: this.form.fecha_pago,
        metodo_pago: this.form.metodo_pago,
        fecha_desde: this.form.fecha_desde,
        fecha_hasta: this.form.fecha_hasta,
        observaciones: this.form.observaciones,
      });

      this.toast.success('Pago registrado');
      this.modalAbierto = false;
      this.form = this.getEmptyForm();
      await this.cargarPagos();
    } catch (e: any) {
      console.error(e);
      this.error = e?.message || 'Error al registrar pago';
      this.toast.error('Error al registrar pago');
    } finally {
      this.guardando = false;
    }
  }

  async eliminarPago(pago: Pago) {
    if (!pago.id) return;

    const ok = confirm('¿Eliminar este pago?');
    if (!ok) return;

    try {
      await this.pagosService.eliminar(pago.id);
      this.toast.success('Pago eliminado');
      await this.cargarPagos();
    } catch (e: any) {
      console.error(e);
      this.toast.error('No se pudo eliminar el pago');
    }
  }

  async filtrarPorFechas() {
    if (!this.fechaDesdeFiltro || !this.fechaHastaFiltro) {
      await this.cargarPagos();
      return;
    }

    this.loading = true;

    try {
      this.pagos = await this.pagosService.getByRangoFechas(
        this.fechaDesdeFiltro,
        this.fechaHastaFiltro,
        'fecha_pago',
        this.ordenAsc
      );
    } catch (e: any) {
      console.error(e);
      this.toast.error('Error al filtrar por fechas');
    } finally {
      this.loading = false;
    }
  }

  async cambiarOrden(campo: 'created_at' | 'fecha_pago' | 'fecha_desde' | 'fecha_hasta') {
    if (this.ordenCampo === campo) {
      this.ordenAsc = !this.ordenAsc;
    } else {
      this.ordenCampo = campo;
      this.ordenAsc = false;
    }

    await this.cargarPagos();
  }

  get pagosFiltrados() {
    return this.pagos.filter((p) => {
      const texto = this.busqueda.toLowerCase();

      const nombreMiembro =
        `${p.miembros?.nombre || ''} ${p.miembros?.apellido || ''}`.toLowerCase();

      const dni = (p.miembros?.dni || '').toLowerCase();
      const plan = (p.plan || '').toLowerCase();
      const metodo = (p.metodo_pago || '').toLowerCase();
      const usuario = (p.users?.nombre || '').toLowerCase();

      return (
        !this.busqueda ||
        nombreMiembro.includes(texto) ||
        dni.includes(texto) ||
        plan.includes(texto) ||
        metodo.includes(texto) ||
        usuario.includes(texto)
      );
    });
  }
}