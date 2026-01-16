// pantalla-principal.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Servicios/auth.service';

@Component({
  selector: 'app-pantalla-principal',
  templateUrl: './pantallaprincipal.component.html',
  styleUrls: ['./pantallaprincipal.component.css']
})
export class PantallaPrincipalComponent {
  showToolbar = true;

  constructor(private auth: AuthService, private router: Router) {}

  irInicio() {
    this.router.navigate(['/']);
  }

  abrirCalculadora() {
    this.router.navigate(['/calculadora']);
  }
    logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),  // vuelve a login
      error: () => console.error('Error al cerrar sesión')
    });
  }
  
}

