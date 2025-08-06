import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css']
})
export class CalculadoraComponent {
  constructor(private router: Router) {}

  seleccionarOpcion(opcion: string) {
    this.router.navigate(['/' + opcion]);
  }

  esRutaActiva(ruta: string): boolean {
    return this.router.url === ruta;
  }}