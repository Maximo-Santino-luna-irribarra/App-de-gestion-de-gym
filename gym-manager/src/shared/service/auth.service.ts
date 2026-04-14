// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export interface RegisterData {
    email: string;
    password: string;
    nombre: string;
    dni?: string;
    telefono?: string;
    roles?: string;
    }

    @Injectable({ providedIn: 'root' })
    export class AuthService {

    constructor(
        private supabase: SupabaseService,
        private router: Router
    ) {}

    // Login
    async login(email: string, password: string) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
        });

        if (error) throw error;
        return data;
    }

    // Register
    async register(registerData: RegisterData) {
        const { email, password, nombre, dni, telefono, roles } = registerData;

        if (!email || !email.includes('@')) {
            console.log('❌ Email inválido');
            throw new Error('Email inválido');
        }

        if (!password || password.length < 6) {
            console.log('❌ Password muy corto (mínimo 6)');
            throw new Error('Password inválido');
        }

        if (!nombre || nombre.trim().length < 2) {
            console.log('❌ Nombre inválido');
            throw new Error('Nombre inválido');
        }

        if (!dni || dni.length < 7) {
            console.log('❌ DNI inválido');
            throw new Error('DNI inválido');
        }

        if (telefono && telefono.length < 8) {
            console.log('❌ Teléfono inválido');
            throw new Error('Teléfono inválido');
        }

        console.log('✅ Datos validados correctamente');

        const { data, error } = await this.supabase.client.auth.signUp({
            email,
            password,
            options: {
            data: { nombre }
            }
        });

        if (error) {
            console.log('❌ Error en auth:', error.message);
            throw error;
        }

        if (data.user) {
            const { error: profileError } = await this.supabase.client
            .from('users')
            .upsert({
                id: data.user.id,
                nombre,
                email: data.user.email,
                dni,
                telefono,
                roles: roles ?? 'staff'
            });

            if (profileError) {
            console.log('❌ Error guardando perfil:', profileError.message);
            throw profileError;
            }
        }

        console.log('🚀 Usuario registrado correctamente');
        return data;
        }

    // Logout
    async logout() {
        await this.supabase.client.auth.signOut();
        this.router.navigate(['/login']);
    }

    // Usuario actual con perfil
    async getUsuario() {
        const { data: { user } } = await this.supabase.client.auth.getUser();
        if (!user) return null;

        const { data: perfil } = await this.supabase.client
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

        return { ...user, ...perfil };
    }

    // Sesión activa?
    async isLoggedIn(): Promise<boolean> {
        const { data: { session } } = await this.supabase.client.auth.getSession();
        return !!session;
    }

    // Escuchar cambios de sesión
    onAuthChange(callback: (session: any) => void) {
        this.supabase.client.auth.onAuthStateChange((_event, session) => {
        callback(session);
        });
    }
    async getSession() {
        const { data: { session } } = await this.supabase.client.auth.getSession();
        return session;
        }
}