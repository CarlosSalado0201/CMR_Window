import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CalculadoraComponent } from './componentes/calculadora/calculadora.component';
import { EditarInventarioComponent } from './componentes/editar-inventario/editar-inventario.component';
import { ProyectoGrandeComponent } from './componentes/proyecto-grande/proyecto-grande.component';
import { TrabajoDiarioComponent } from './componentes/trabajo-diario/trabajo-diario.component';
import { PantallaPrincipalComponent } from './pantallaprincipal/pantallaprincipal.component';
import { PantallaReportesComponent } from './pantalla-reportes/pantalla-reportes.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AuthGuard } from './guards/guard';
import { HistorialReportesComponent } from './historial-reportes/historial-reportes.component';
import { CartasComponent } from './cartas/cartas.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: PantallaPrincipalComponent , canActivate: [AuthGuard]},
  { path: 'calculadora', component: CalculadoraComponent,canActivate: [AuthGuard] },
  { path: 'editar', component: EditarInventarioComponent,canActivate: [AuthGuard] },
  { path: 'proyectoGrande', component: ProyectoGrandeComponent,canActivate: [AuthGuard] },
  { path: 'trabajoDiario', component: TrabajoDiarioComponent,canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // por defecto va al login
  { path: 'reportes', component: PantallaReportesComponent, canActivate: [AuthGuard] },
  { path: 'generar', component: ReportesComponent,canActivate: [AuthGuard]},
  { path: 'historial', component: HistorialReportesComponent, canActivate: [AuthGuard] },
  { path: 'generar-carta', component: CartasComponent },

];

@NgModule({
imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
