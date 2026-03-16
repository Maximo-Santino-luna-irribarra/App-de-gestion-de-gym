import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
    path: 'login',
            loadComponent: () => import('./auth/login/login')
            .then(m => m.Login)
    },
    {
    path: 'registro',
    loadComponent: () => import('./auth/register/register')
        .then(m => m.Register)
    }, {
    path: 'home',
    loadComponent: () => import('./dashboard/home/home')
        .then(m => m.Home)
    },
    








];
