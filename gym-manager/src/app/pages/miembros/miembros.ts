import { ToastService } from './../../../shared/service/modal.services';
import { ModalMiembro } from './../modal-miembros/modal-miembros';
import { MiembrosService, Miembro } from './../../../shared/service/miembro.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalRenovar } from '../modal-renovar/modal-renovar';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [FormsModule, ModalRenovar],
  templateUrl: './miembros.html',
})
export class Miembros implements OnInit {

  miembros: Miembro[] = [];
  loading = false;
  user = { id: 'admin' };
  modalAbierto = false; 
  busqueda = '';
  filtroEstado = '';
  filtroPlan = '';
  modalRenovarAbierto = false;
  miembroSeleccionado: any;

  constructor(
    private miembrosService: MiembrosService,
    private toast: ToastService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log("asdsasdsad")
  
    await this.cargarMiembros();
    this.cd.detectChanges();
  }

  async cargarMiembros() {
    this.loading = true;
    try {
      this.miembros = await this.miembrosService.getAll();
     
    } catch (e: any) {
      this.toast.error('Error al cargar miembros');
    } finally {
      this.loading = false;
    }
  }
  async refrescarDatos() {
    await this.cargarMiembros();
  }

  get miembrosFiltrados() {
    return this.miembros.filter(m => {
      const matchBusqueda = !this.busqueda ||
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        m.dni.includes(this.busqueda);

      const matchEstado = !this.filtroEstado ||
        (this.filtroEstado === 'activo' ? m.estado === true : m.estado === false);

      const matchPlan = !this.filtroPlan || m.plan === this.filtroPlan;

      return matchBusqueda && matchEstado && matchPlan;
    });
  }

  async registrarAsistencia(m: Miembro) {
    if (!m.id) return;

    try {
      await this.miembrosService.registrarAsistencia(m.id, m.cant_asistencias ?? 0);
      this.toast.success('Asistencia registrada');
      await this.cargarMiembros();
    } catch (e: any) {
      this.toast.error('No se pudo registrar asistencia');
    }
  }

  async eliminar(m: Miembro) {
    if (!m.id || !confirm(`¿Eliminar a ${m.nombre} ${m.apellido}?`)) return;

    try {
      await this.miembrosService.eliminar(m.id);
      this.toast.success('Miembro eliminado');
      await this.cargarMiembros();
    } catch (e: any) {
      this.toast.error('Error al eliminar miembro');
    }
  }

  abrirModal(miembro: any) {
    this.miembroSeleccionado = miembro;
    this.modalRenovarAbierto = true;
  }

  cerrarModal() {
    this.modalRenovarAbierto = false;
  }
}