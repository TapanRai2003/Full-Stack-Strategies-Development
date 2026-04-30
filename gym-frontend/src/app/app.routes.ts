import { Routes } from '@angular/router';

import { ManageClasses } from './components/manage-classes/manage-classes';
import { authGuard } from './guards/auth.guard';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { ClassList } from './components/class-list/class-list';
import { MyBookings } from './components/my-bookings/my-bookings';
import { Profile } from './components/profile/profile';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { ClassForm } from './components/class-form/class-form';
import { Analytics } from './components/analytics/analytics';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'classes', component: ClassList },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  { path: 'my-bookings', component: MyBookings, canActivate: [authGuard] },

  { path: 'admin', component: AdminDashboard, canActivate: [authGuard] },
  { path: 'admin/add-class', component: ClassForm, canActivate: [authGuard] },
  { path: 'admin/edit-class/:id', component: ClassForm, canActivate: [authGuard] },
  { path: 'admin/manage-classes', component: ManageClasses, canActivate: [authGuard] },

  { path: 'analytics', component: Analytics, canActivate: [authGuard] },

  { path: '**', component: NotFound }
];