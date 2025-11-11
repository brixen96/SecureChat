import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ADMIN_ROUTES } from './admin.routes';
import { UserListComponent } from './user-list/user-list';
import { AdminChatComponent } from './chat/chat';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    ReactiveFormsModule,
    FontAwesomeModule,

  ]
})
export class AdminModule { }