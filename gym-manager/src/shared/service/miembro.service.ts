// src/app/services/miembros.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Miembro {
    id?: string;
    nro_socio?: number;
    nombre: string;
    apellido: string;
    dni: string;
    email?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    foto_url?: string;
    plan: string;
    fecha_inscripcion?: string;
    fecha_vencimiento: string;
    estado?: boolean;
    pago_al_dia?: boolean;
    cant_asistencias?: number;
    ultimo_acceso?: string;
    created_at?: string;
    updated_at?: string;
    }

    @Injectable({ providedIn: 'root' })
    export class MiembrosService {
    // Ajustá estos planes a los reales de tu sistema
    private readonly planesValidos = ['mensual', 'trimestral', 'semestral', 'anual'];

    constructor(private supabase: SupabaseService) {}

    // =========================
    // VALIDACIONES
    // =========================

    private esTextoValido(valor?: string, min = 2, max = 50): boolean {
        if (!valor) return false;
        const limpio = valor.trim();
        return limpio.length >= min && limpio.length <= max;
    }

    private validarNombre(nombre: string, campo: string) {
        if (!this.esTextoValido(nombre, 2, 50)) {
        throw new Error(`${campo} debe tener entre 2 y 50 caracteres.`);
        }

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
        if (!regex.test(nombre.trim())) {
        throw new Error(`${campo} contiene caracteres inválidos.`);
        }
    }

    private validarDni(dni: string) {
        const limpio = dni?.trim();

        if (!limpio) {
        throw new Error('El DNI es obligatorio.');
        }

        if (!/^\d{7,8}$/.test(limpio)) {
        throw new Error('El DNI debe tener 7 u 8 dígitos numéricos.');
        }
    }

    private validarEmail(email?: string) {
        if (!email) return;

        const limpio = email.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(limpio)) {
        throw new Error('El email no tiene un formato válido.');
        }
    }

    private validarTelefono(telefono?: string) {
        if (!telefono) return;

        const limpio = telefono.trim();

        // Acepta números, espacios, +, -, paréntesis
        const regex = /^[0-9+\-\s()]{6,20}$/;
        if (!regex.test(limpio)) {
        throw new Error('El teléfono no tiene un formato válido.');
        }
    }

    private validarFecha(fecha?: string, campo = 'La fecha') {
        if (!fecha) return false;

        const date = new Date(fecha);
        if (isNaN(date.getTime())) {
        throw new Error(`${campo} no es válida.`);
        }

        return true;
    }

    private validarPlan(plan: string) {
        if (!plan || !this.planesValidos.includes(plan.trim().toLowerCase())) {
        throw new Error(`El plan no es válido. Planes permitidos: ${this.planesValidos.join(', ')}`);
        }
    }

    private validarNumeroNoNegativo(valor: number | undefined, campo: string) {
        if (valor === undefined || valor === null) return;

        if (!Number.isInteger(valor) || valor < 0) {
        throw new Error(`${campo} debe ser un número entero mayor o igual a 0.`);
        }
    }

    private normalizarTexto(valor?: string): string | undefined {
        return valor?.trim();
    }

    private validarMiembroCompleto(miembro: Miembro) {
        this.validarNombre(miembro.nombre, 'El nombre');
        this.validarNombre(miembro.apellido, 'El apellido');
        this.validarDni(miembro.dni);
        this.validarEmail(miembro.email);
        this.validarTelefono(miembro.telefono);
        this.validarPlan(miembro.plan);

        if (!miembro.fecha_vencimiento) {
        throw new Error('La fecha de vencimiento es obligatoria.');
        }

        this.validarFecha(miembro.fecha_vencimiento, 'La fecha de vencimiento');

        if (miembro.fecha_inscripcion) {
        this.validarFecha(miembro.fecha_inscripcion, 'La fecha de inscripción');

        const inscripcion = new Date(miembro.fecha_inscripcion);
        const vencimiento = new Date(miembro.fecha_vencimiento);

        if (vencimiento < inscripcion) {
            throw new Error('La fecha de vencimiento no puede ser anterior a la fecha de inscripción.');
        }
        }

        if (miembro.fecha_nacimiento) {
        this.validarFecha(miembro.fecha_nacimiento, 'La fecha de nacimiento');

        const nacimiento = new Date(miembro.fecha_nacimiento);
        const hoy = new Date();

        if (nacimiento > hoy) {
            throw new Error('La fecha de nacimiento no puede ser futura.');
        }
        }

        this.validarNumeroNoNegativo(miembro.nro_socio, 'El número de socio');
        this.validarNumeroNoNegativo(miembro.cant_asistencias, 'La cantidad de asistencias');
    }

    private validarCambios(cambios: Partial<Miembro>) {
        if (cambios.nombre !== undefined) {
        this.validarNombre(cambios.nombre, 'El nombre');
        }

        if (cambios.apellido !== undefined) {
        this.validarNombre(cambios.apellido, 'El apellido');
        }

        if (cambios.dni !== undefined) {
        this.validarDni(cambios.dni);
        }

        if (cambios.email !== undefined) {
        this.validarEmail(cambios.email);
        }

        if (cambios.telefono !== undefined) {
        this.validarTelefono(cambios.telefono);
        }

        if (cambios.plan !== undefined) {
        this.validarPlan(cambios.plan);
        }

        if (cambios.fecha_vencimiento !== undefined) {
        this.validarFecha(cambios.fecha_vencimiento, 'La fecha de vencimiento');
        }

        if (cambios.fecha_inscripcion !== undefined) {
        this.validarFecha(cambios.fecha_inscripcion, 'La fecha de inscripción');
        }

        if (cambios.fecha_nacimiento !== undefined) {
        this.validarFecha(cambios.fecha_nacimiento, 'La fecha de nacimiento');

        const nacimiento = new Date(cambios.fecha_nacimiento);
        if (nacimiento > new Date()) {
            throw new Error('La fecha de nacimiento no puede ser futura.');
        }
        }

        if (cambios.nro_socio !== undefined) {
        this.validarNumeroNoNegativo(cambios.nro_socio, 'El número de socio');
        }

        if (cambios.cant_asistencias !== undefined) {
        this.validarNumeroNoNegativo(cambios.cant_asistencias, 'La cantidad de asistencias');
        }
    }

    private sanitizarMiembro(miembro: Miembro): Miembro {
        return {
        ...miembro,
        nombre: this.normalizarTexto(miembro.nombre) ?? '',
        apellido: this.normalizarTexto(miembro.apellido) ?? '',
        dni: this.normalizarTexto(miembro.dni) ?? '',
        email: this.normalizarTexto(miembro.email),
        telefono: this.normalizarTexto(miembro.telefono),
        plan: this.normalizarTexto(miembro.plan)?.toLowerCase() ?? '',
        foto_url: this.normalizarTexto(miembro.foto_url),
        };
    }

    private sanitizarCambios(cambios: Partial<Miembro>): Partial<Miembro> {
        return {
        ...cambios,
        nombre: cambios.nombre !== undefined ? this.normalizarTexto(cambios.nombre) : undefined,
        apellido: cambios.apellido !== undefined ? this.normalizarTexto(cambios.apellido) : undefined,
        dni: cambios.dni !== undefined ? this.normalizarTexto(cambios.dni) : undefined,
        email: cambios.email !== undefined ? this.normalizarTexto(cambios.email) : undefined,
        telefono: cambios.telefono !== undefined ? this.normalizarTexto(cambios.telefono) : undefined,
        plan: cambios.plan !== undefined ? this.normalizarTexto(cambios.plan)?.toLowerCase() : undefined,
        foto_url: cambios.foto_url !== undefined ? this.normalizarTexto(cambios.foto_url) : undefined,
        };
    }

    // =========================
    // CRUD
    // =========================

    async getAll() {
        const { data, error } = await this.supabase.client
        .from('miembros')
        .select('*')
        .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Miembro[];
    }

    async getById(id: string) {
        if (!id?.trim()) {
        throw new Error('El id es obligatorio.');
        }

        const { data, error } = await this.supabase.client
        .from('miembros')
        .select('*')
        .eq('id', id)
        .single();

        if (error) throw error;
        return data as Miembro;
    }

    async buscar(termino: string) {
        const t = termino?.trim();

        if (!t || t.length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres.');
        }

        const { data, error } = await this.supabase.client
        .from('miembros')
        .select('*')
        .or(`nombre.ilike.%${t}%,apellido.ilike.%${t}%,dni.ilike.%${t}%`);

        if (error) throw error;
        return data as Miembro[];
    }

    async filtrar(estado?: boolean, plan?: string) {
        let query = this.supabase.client.from('miembros').select('*');

        if (estado !== undefined) {
        query = query.eq('estado', estado);
        }

        if (plan) {
        const planNormalizado = plan.trim().toLowerCase();
        this.validarPlan(planNormalizado);
        query = query.eq('plan', planNormalizado);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data as Miembro[];
    }

    async crear(miembro: Miembro) {
        const limpio = this.sanitizarMiembro(miembro);
        this.validarMiembroCompleto(limpio);

        const { data, error } = await this.supabase.client
        .from('miembros')
        .insert({
            ...limpio,
            cant_asistencias: limpio.cant_asistencias ?? 0,
            estado: limpio.estado ?? true,
            pago_al_dia: limpio.pago_al_dia ?? true,
        })
        .select()
        .single();

        if (error) throw error;
        return data as Miembro;
    }

    async editar(id: string, cambios: Partial<Miembro>) {
        if (!id?.trim()) {
        throw new Error('El id es obligatorio.');
        }

        const limpio = this.sanitizarCambios(cambios);
        this.validarCambios(limpio);

        const { data, error } = await this.supabase.client
        .from('miembros')
        .update({
            ...limpio,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

        if (error) throw error;
        return data as Miembro;
    }

    async eliminar(id: string) {
        if (!id?.trim()) {
        throw new Error('El id es obligatorio.');
        }

        const { error } = await this.supabase.client
        .from('miembros')
        .delete()
        .eq('id', id);

        if (error) throw error;
    }

    async renovar(id: string, plan: string, diasDuracion: number) {
        if (!id?.trim()) {
        throw new Error('El id es obligatorio.');
        }

        const planNormalizado = plan?.trim().toLowerCase();
        this.validarPlan(planNormalizado);

        if (!Number.isInteger(diasDuracion) || diasDuracion <= 0) {
        throw new Error('La duración del plan debe ser un número entero mayor a 0.');
        }

        const hoy = new Date();
        const vencimiento = new Date(hoy);
        vencimiento.setDate(vencimiento.getDate() + diasDuracion);

        return this.editar(id, {
        plan: planNormalizado,
        fecha_vencimiento: vencimiento.toISOString().split('T')[0],
        estado: true,
        pago_al_dia: true,
        });
    }

    async registrarAsistencia(id: string, asistenciasActuales: number) {
        if (!id?.trim()) {
        throw new Error('El id es obligatorio.');
        }

        if (!Number.isInteger(asistenciasActuales) || asistenciasActuales < 0) {
        throw new Error('La cantidad actual de asistencias no es válida.');
        }

        return this.editar(id, {
        cant_asistencias: asistenciasActuales + 1,
        ultimo_acceso: new Date().toISOString(),
        });
    }
}