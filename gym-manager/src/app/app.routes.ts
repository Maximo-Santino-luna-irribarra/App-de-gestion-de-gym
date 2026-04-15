import { AuthGuard } from './guards/auth-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // 🔓 Públicas
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

    // 🔒 Protegidas
    {
        path: '',
        canActivate: [AuthGuard],
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
        },
        {
            path: 'pagos',
            loadComponent: () =>
            import('../app/pages/pagos/pagos').then(m => m.Pagos)
        },
        {
            path: 'estadisticas',
            loadComponent: () =>
            import('./pages/estadisticas/estadisticas').then(m => m.Estadisticas)
        }
        
        ]
}
];