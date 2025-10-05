import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CalculadoraComponent } from './Componentes/calculadora/calculadora.component';
import { EditarInventarioComponent } from './Componentes/editar-inventario/editar-inventario.component';
import { ProyectoGrandeComponent } from './Componentes/proyecto-grande/proyecto-grande.component';
import { TrabajoDiarioComponent } from './Componentes/trabajo-diario/trabajo-diario.component';
import { PantallaPrincipalComponent } from './pantallaprincipal/pantallaprincipal.component';
import { PantallaReportesComponent } from './pantalla-reportes/pantalla-reportes.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AuthGuard } from './guards/guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: PantallaPrincipalComponent , canActivate: [AuthGuard]},
  { path: 'calculadora', component: CalculadoraComponent,canActivate: [AuthGuard] },
  { path: 'editar', component: EditarInventarioComponent,canActivate: [AuthGuard] },
  { path: 'proyectoGrande', component: ProyectoGrandeComponent,canActivate: [AuthGuard] },
  { path: 'trabajoDiario', component: TrabajoDiarioComponent,canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // por defecto va al login
  { path: 'reportes', component: PantallaReportesComponent, canActivate: [AuthGuard] },
  { path: 'generar', component: ReportesComponent,canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
