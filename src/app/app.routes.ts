import { Routes } from '@angular/router';
import { Login } from './modules/auth/login/login';
import { Chat } from './modules/chat/chat';
import { Menu } from './modules/menu/menu';
import { authGuard } from './guards/auth-guard';
import { ForcePasswordChange } from './modules/auth/force-password-change/force-password-change';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'force-password-change', component: ForcePasswordChange, canActivate: [authGuard] },
    { path: 'chat', component: Chat, canActivate: [authGuard] },
    { path: 'menu', component: Menu, canActivate: [authGuard] },
    {
      path: 'admin',
      loadChildren: () => import('./modules/admin/admin-module').then(m => m.AdminModule),
      canActivate: [authGuard]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
