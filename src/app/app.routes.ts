import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing.component';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { PayslipEditorComponent } from './components/payslip-editor.component';
import { SettingsComponent } from './components/settings.component';
import { ClientsComponent } from './components/clients.component';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'dashboard',
    component: PayslipEditorComponent,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'settings/clients',
    component: ClientsComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
