import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list';
import { AdminChatComponent } from './chat/chat';
import { CreateUserComponent } from './create-user/create-user';
import { AdminMenu } from './menu/menu';

export const ADMIN_ROUTES: Routes = [
	{ path: 'users/new', component: CreateUserComponent },
	{ path: 'users', component: UserListComponent },
	{ path: 'chat/:username', component: AdminChatComponent },
	{ path: 'menu', component: AdminMenu },
	{ path: '', redirectTo: 'users', pathMatch: 'full' },
];
