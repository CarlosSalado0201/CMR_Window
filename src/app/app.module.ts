import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalculadoraComponent } from './Componentes/calculadora/calculadora.component';
import { TrabajoDiarioComponent } from './Componentes/trabajo-diario/trabajo-diario.component';
import { ProyectoGrandeComponent } from './Componentes/proyecto-grande/proyecto-grande.component';
import { EditarInventarioComponent } from './Componentes/editar-inventario/editar-inventario.component';
import { LoginComponent } from './login/login.component';
import { PantallaPrincipalComponent } from './pantallaprincipal/pantallaprincipal.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PantallaReportesComponent } from './pantalla-reportes/pantalla-reportes.component';
import { ReportesComponent } from './reportes/reportes.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';
import { HistorialReportesComponent } from './historial-reportes/historial-reportes.component';
import { CartasComponent } from './cartas/cartas.component';
@NgModule({
  declarations: [
    AppComponent,
    PantallaPrincipalComponent,
    LoginComponent,
    CalculadoraComponent,
    TrabajoDiarioComponent,
    ProyectoGrandeComponent,
    EditarInventarioComponent,
    PantallaReportesComponent,
    ReportesComponent,
    HistorialReportesComponent,
    CartasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CredentialsInterceptor,
    multi: true
  }
],

  bootstrap: [AppComponent]
})
export class AppModule { }
