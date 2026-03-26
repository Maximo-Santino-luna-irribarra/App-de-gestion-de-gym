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

  // Traer todos con datos del miembro y usuario
    async getAll() {
        const { data, error } = await this.supabase.client
        .from('pagos')
        .select(`
            *,
            miembros ( nombre, apellido, dni ),
            users ( nombre )
        `)
        .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Pago[];
    }

  // Pagos de un miembro específico
async getByMiembro(miembroId: string) {
    const { data, error } = await this.supabase.client
        .from('pagos')
        .select(`*, users ( nombre )`)
        .eq('miembro_id', miembroId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Pago[];
}

  // Registrar pago — el trigger renueva la membresía automáticamente
async registrar(pago: Omit<Pago, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase.client
        .from('pagos')
        .insert(pago)
        .select()
        .single();

    if (error) throw error;
    return data as Pago;
}
}
