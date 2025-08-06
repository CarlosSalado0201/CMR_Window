import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculadoraComponent } from './Componentes/calculadora/calculadora.component';
import { EditarInventarioComponent } from './Componentes/editar-inventario/editar-inventario.component';
import { ProyectoGrandeComponent } from './Componentes/proyecto-grande/proyecto-grande.component';
import { TrabajoDiarioComponent } from './Componentes/trabajo-diario/trabajo-diario.component';

// arreglo de rutas o paths de la aplicacion, para navegar entre componentes
const routes: Routes = [
  {path : 'calculadora', component:CalculadoraComponent},
  {path : 'editar', component:EditarInventarioComponent},
  {path : 'proyectoGrande', component:ProyectoGrandeComponent},
  {path : 'trabajoDiario', component:TrabajoDiarioComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
