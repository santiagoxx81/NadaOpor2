import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component/login.component';
import { AdminDashboardComponent } from './pages/admin.dashboard/admin.dashboard.component';
import { authGuard } from './guards/auth.guard-guard';
import { adminGuard } from './guards/admin.guard-guard';
import { UsuarioDashboardComponent } from './pages/usuario/usuario.dashboard.component';
import { HomeComponent } from './pages/home/home.component';


export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  // CIDADÃO
  { path: 'usuario/dashboard', component: UsuarioDashboardComponent, canActivate: [authGuard] },
  // ADMIN
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },

  // defaults
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
