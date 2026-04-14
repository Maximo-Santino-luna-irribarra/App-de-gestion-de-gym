// src/app/shared/service/pagos.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Pago {
    id?: string;
    miembro_id: string;
    usuario_id: string;
    monto: number;
    plan: string;
    fecha_pago?: string;
    metodo_pago?: string;
    fecha_desde: string;
    fecha_hasta: string;
    observaciones?: string;
    created_at?: string;
    
    // join
    miembros?: { nombre: string; apellido: string; dni: string };
    users?: { nombre: string };
}

@Injectable({ providedIn: 'root' })
export class PagosService {

    constructor(private supabase: SupabaseService) {}

  // Traer todos con joins y orden configurable
    async getAll(
        orderBy: 'created_at' | 'fecha_pago' | 'fecha_desde' | 'fecha_hasta' = 'created_at',
        ascending: boolean = false
    ) {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .select(`
            *,
            miembros ( nombre, apellido, dni ),
            users ( nombre )
        `)
        .order(orderBy, { ascending });

        if (error) throw error;
        return data as Pago[];
    }

    // Traer un pago por id
    async getById(id: string) {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .select(`
            *,
            miembros ( nombre, apellido, dni ),
            users ( nombre )
        `)
        .eq('id', id)
        .single();

        if (error) throw error;
        return data as Pago;
    }

    // Pagos de un miembro específico
    async getByMiembro(
        miembroId: string,
        orderBy: 'created_at' | 'fecha_pago' | 'fecha_desde' | 'fecha_hasta' = 'created_at',
        ascending: boolean = false
    ) {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .select(`
            *,
            users ( nombre )
        `)
        .eq('miembro_id', miembroId)
        .order(orderBy, { ascending });

        if (error) throw error;
        return data as Pago[];
    }

    // Registrar pago
    async registrar(pago: Omit<Pago, 'id' | 'created_at' | 'miembros' | 'users'>) {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .insert(pago)
        .select()
        .single();

        if (error) throw error;
        return data as Pago;
    }

    // Editar pago
    async actualizar(id: string, pago: Partial<Omit<Pago, 'id' | 'created_at' | 'miembros' | 'users'>>) {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .update(pago)
        .eq('id', id)
        .select()
        .single();

        if (error) throw error;
        return data as Pago;
    }

    // Eliminar pago
    async eliminar(id: string) {
        const { error } = await this.supabase.client
        .from('pagos')
        .delete()
        .eq('id', id);

        if (error) throw error;
        return true;
    }

    // Filtrar por rango de fechas de pago
    async getByRangoFechas(
        desde: string,
        hasta: string,
        orderBy: 'fecha_pago' | 'created_at' = 'fecha_pago',
        ascending: boolean = false
    ) {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .select(`
            *,
            miembros ( nombre, apellido, dni ),
            users ( nombre )
        `)
        .gte('fecha_pago', desde)
        .lte('fecha_pago', hasta)
        .order(orderBy, { ascending });

        if (error) throw error;
        return data as Pago[];
    }

    // Esto ya lo tenías
    async actualizarVencimiento(miembroId: string, fechaHasta: string) {
        return await this.supabase.client
        .from('miembros')
        .update({
            fecha_vencimiento: fechaHasta,
            estado: true,
            pago_al_dia: true
        })
        .eq('id', miembroId);
    }

}
