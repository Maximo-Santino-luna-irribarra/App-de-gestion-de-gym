import { Component,OnInit } from '@angular/core';
import { MiembrosService } from '../../../shared/service/miembro.service';
import { PagosService } from '../../../shared/service/pagos.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  loading = false;

  stats = {
    total: 0,
    activos: 0,
    vencidos: 0,
    ingresos: '$0'
  };

  barras: { mes: string; alto: number; activo?: boolean }[] = [];

  ultimos: { nombre: string; fecha: string; estado: string }[] = [];

  mesActual = '';

  constructor(
    private miembrosService: MiembrosService,
    private pagosService: PagosService
  ) {}

  async ngOnInit() {
    await this.cargarDashboard();
  }

  async cargarDashboard() {
    this.loading = true;

    try {
      const miembros = await this.miembrosService.getAll();
      const pagos = await this.pagosService.getAll();

      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      this.mesActual = hoy.toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric'
      });

      const activos = miembros.filter((m: any) => m.estado === true).length;

      const vencidos = miembros.filter((m: any) => {
        if (!m.fecha_vencimiento) return false;
        return new Date(m.fecha_vencimiento) < hoy;
      }).length;

      const pagosMes = pagos.filter((p: any) => {
        if (!p.fecha_pago) return false;
        const fecha = new Date(p.fecha_pago);
        return fecha >= inicioMes && fecha <= finMes;
      });

      const ingresosMes = pagosMes.reduce((acc: number, p: any) => {
        return acc + Number(p.monto || 0);
      }, 0);

      this.stats = {
        total: miembros.length,
        activos,
        vencidos,
        ingresos: `$${ingresosMes.toLocaleString('es-AR')}`
      };

      this.ultimos = miembros
        .slice()
        .sort((a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        .slice(0, 4)
        .map((m: any) => ({
          nombre: `${m.nombre} ${m.apellido}`,
          fecha: this.formatearFecha(m.created_at),
          estado: m.estado ? 'activo' : 'pendiente'
        }));

      this.barras = this.generarBarras(miembros);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  private generarBarras(miembros: any[]) {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const hoy = new Date();
    const resultado: { mes: string; alto: number; activo?: boolean }[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();

      const cantidad = miembros.filter((m: any) => {
        if (!m.created_at) return false;
        const creada = new Date(m.created_at);
        return creada.getMonth() === mes && creada.getFullYear() === anio;
      }).length;

      resultado.push({
        mes: meses[mes],
        alto: Math.max(cantidad * 12, 10),
        activo: i === 0
      });
    }

    return resultado;
  }

  private formatearFecha(fecha: string): string {
    const d = new Date(fecha);

    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}