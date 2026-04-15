import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiembrosService, Miembro } from '../../../shared/service/miembro.service';
import { PagosService, Pago } from '../../../shared/service/pagos.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-estadisticas',
  imports: [],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  loading = false;
  error = '';

  miembros: Miembro[] = [];
  pagos: Pago[] = [];

  resumen = {
    totalMiembros: 0,
    activos: 0,
    inactivos: 0,
    vencidos: 0,
    ingresosMes: 0,
    pagosMes: 0,
  };

  pagosPorMes: { mes: string; total: number; cantidad: number }[] = [];
  miembrosPorMes: { mes: string; cantidad: number }[] = [];
  planesMasVendidos: { plan: string; cantidad: number }[] = [];
  ultimosPagos: Pago[] = [];

  constructor(
    private miembrosService: MiembrosService,
    private pagosService: PagosService,
    private cd :ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarEstadisticas();
    this.cd.detectChanges()
  }

  async cargarEstadisticas() {
    this.loading = true;
    this.error = '';

    try {
      this.miembros = await this.miembrosService.getAll();
      this.pagos = await this.pagosService.getAll('created_at', false);

      this.calcularResumen();
      this.calcularPagosPorMes();
      this.calcularMiembrosPorMes();
      this.calcularPlanesMasVendidos();
      this.calcularUltimosPagos();
    } catch (e: any) {
      console.error(e);
      this.error = 'Error al cargar estadísticas';
    } finally {
      this.loading = false;
    }
  }

  private calcularResumen() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const activos = this.miembros.filter(m => m.estado === true).length;
    const inactivos = this.miembros.filter(m => m.estado === false).length;

    const vencidos = this.miembros.filter(m => {
      if (!m.fecha_vencimiento) return false;
      const vencimiento = new Date(m.fecha_vencimiento);
      return vencimiento < hoy;
    }).length;

    const pagosMes = this.pagos.filter(p => {
      if (!p.fecha_pago) return false;
      const fecha = new Date(p.fecha_pago);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    const ingresosMes = pagosMes.reduce((acc, p) => acc + Number(p.monto || 0), 0);

    this.resumen = {
      totalMiembros: this.miembros.length,
      activos,
      inactivos,
      vencidos,
      ingresosMes,
      pagosMes: pagosMes.length,
    };
  }

  private calcularPagosPorMes() {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();

    this.pagosPorMes = [];

    for (let i = 5; i >= 0; i--) {
      const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fechaBase.getMonth();
      const anio = fechaBase.getFullYear();

      const pagosDelMes = this.pagos.filter(p => {
        if (!p.fecha_pago) return false;
        const fecha = new Date(p.fecha_pago);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      });

      this.pagosPorMes.push({
        mes: meses[mes],
        total: pagosDelMes.reduce((acc, p) => acc + Number(p.monto || 0), 0),
        cantidad: pagosDelMes.length,
      });
    }
  }

  private calcularMiembrosPorMes() {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();

    this.miembrosPorMes = [];

    for (let i = 5; i >= 0; i--) {
      const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fechaBase.getMonth();
      const anio = fechaBase.getFullYear();

      const cantidad = this.miembros.filter(m => {
        if (!m.created_at) return false;
        const fecha = new Date(m.created_at);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      }).length;

      this.miembrosPorMes.push({
        mes: meses[mes],
        cantidad,
      });
    }
  }

  private calcularPlanesMasVendidos() {
    const contador: Record<string, number> = {};

    for (const pago of this.pagos) {
      const plan = pago.plan || 'Sin plan';
      contador[plan] = (contador[plan] || 0) + 1;
    }

    this.planesMasVendidos = Object.entries(contador)
      .map(([plan, cantidad]) => ({ plan, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  private calcularUltimosPagos() {
    this.ultimosPagos = [...this.pagos]
      .sort((a, b) =>
        new Date(b.created_at || b.fecha_pago || '').getTime() -
        new Date(a.created_at || a.fecha_pago || '').getTime()
      )
      .slice(0, 6);
  }

  getMaxPagosMes(): number {
    const max = Math.max(...this.pagosPorMes.map(p => p.total), 1);
    return max;
  }

  getMaxMiembrosMes(): number {
    const max = Math.max(...this.miembrosPorMes.map(m => m.cantidad), 1);
    return max;
  }

  getBarHeight(valor: number, max: number): number {
    return Math.max((valor / max) * 120, 8);
  }

  formatMoney(valor: number): string {
    return `$${valor.toLocaleString('es-AR')}`;
  }
}