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

    constructor(private supabase: SupabaseService) {}

    // Traer todos
    async getAll() {
        const { data, error } = await this.supabase.client
        .from('miembros')
        .select('*')
        .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Miembro[];
    }

    // Traer uno por id
    async getById(id: string) {
        const { data, error } = await this.supabase.client
        .from('miembros')
        .select('*')
        .eq('id', id)
        .single();

        if (error) throw error;
        return data as Miembro;
    }

    // Buscar por nombre o DNI
    async buscar(termino: string) {
        const { data, error } = await this.supabase.client
        .from('miembros')
        .select('*')
        .or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%,dni.ilike.%${termino}%`);

        if (error) throw error;
        return data as Miembro[];
    }

    // Filtrar por estado y plan
    async filtrar(estado?: boolean, plan?: string) {
        let query = this.supabase.client.from('miembros').select('*');

        if (estado !== undefined) query = query.eq('estado', estado);
        if (plan) query = query.eq('plan', plan);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data as Miembro[];
    }

    // Crear
    async crear(miembro: Miembro) {
        const { data, error } = await this.supabase.client
        .from('miembros')
        .insert(miembro)
        .select()
        .single();

        if (error) throw error;
        return data as Miembro;
    }

    // Editar
    async editar(id: string, cambios: Partial<Miembro>) {
        const { data, error } = await this.supabase.client
        .from('miembros')
        .update({ ...cambios, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

        if (error) throw error;
        return data as Miembro;
    }

    // Eliminar
    async eliminar(id: string) {
        const { error } = await this.supabase.client
        .from('miembros')
        .delete()
        .eq('id', id);

        if (error) throw error;
    }

  // Renovar cuota
    async renovar(id: string, plan: string, diasDuracion: number) {
        const hoy = new Date();
        const vencimiento = new Date(hoy);
        vencimiento.setDate(vencimiento.getDate() + diasDuracion);

        return this.editar(id, {
        plan,
        fecha_vencimiento: vencimiento.toISOString().split('T')[0],
        estado: true,
        pago_al_dia: true,
        });
    }

  // Registrar asistencia
    async registrarAsistencia(id: string, asistenciasActuales: number) {
        return this.editar(id, {
            cant_asistencias: asistenciasActuales + 1,
            ultimo_acceso: new Date().toISOString(),
        });
    }
}