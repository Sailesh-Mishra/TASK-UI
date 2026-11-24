import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'tasks/new',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/task-form/task-form.component').then((m) => m.TaskFormComponent),
    },
    {
        path: 'tasks/:id/edit',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/task-form/task-form.component').then((m) => m.TaskFormComponent),
    },
    {
        path: 'tasks',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/tasks/tasks.component').then((m) => m.TasksComponent),
    },
    { path: '**', redirectTo: 'login' },
];
