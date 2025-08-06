import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalculadoraComponent } from './Componentes/calculadora/calculadora.component';
import { TrabajoDiarioComponent } from './Componentes/trabajo-diario/trabajo-diario.component';
import { ProyectoGrandeComponent } from './Componentes/proyecto-grande/proyecto-grande.component';
import { EditarInventarioComponent } from './Componentes/editar-inventario/editar-inventario.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CalculadoraComponent,
    TrabajoDiarioComponent,
    ProyectoGrandeComponent,
    EditarInventarioComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
