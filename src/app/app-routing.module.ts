import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./pages/users/users.module').then(m => m.UsersPageModule)
  },
  {
    path: 'attendance',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/attendance/attendance-list/attendance-list.page').then(m => m.AttendanceListPage)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/attendance/attendance-form/attendance-form.page').then(m => m.AttendanceFormPage)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/attendance/attendance-form/attendance-form.page').then(m => m.AttendanceFormPage)
      }
    ]
  },
  {
    path: 'attendance-history',
    loadComponent: () => import('./pages/attendance/attendance-history/attendance-history.page').then(m => m.AttendanceHistoryPage)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}