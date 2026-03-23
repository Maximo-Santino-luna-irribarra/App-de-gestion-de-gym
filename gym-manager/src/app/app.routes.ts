import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
        path: 'login',
        loadComponent: () =>
        import('./auth/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        loadComponent: () =>
        import('./auth/register/register').then(m => m.Register)
    },

    {
        path: '',
        loadComponent: () =>
        import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
        {
            path: 'home',
            loadComponent: () =>
            import('./dashboard/home/home').then(m => m.Home)
        },
        {
            path: 'miembros',
            loadComponent: () =>
            import('./pages/miembros/miembros').then(m => m.Miembros)
        }
        ]
    }
];