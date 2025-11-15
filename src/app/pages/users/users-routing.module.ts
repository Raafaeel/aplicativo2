import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersPage } from './users.page';
import { UserEditPage } from './user-edit/user-edit.page';

const routes: Routes = [
  {
    path: '',
    component: UsersPage
  },
  {
    path: ':id/edit',
    component: UserEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersPageRoutingModule {}