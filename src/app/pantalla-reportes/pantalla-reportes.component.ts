import { Component } from '@angular/core';
import { AuthService } from '../Servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pantalla-reportes',
  templateUrl: './pantalla-reportes.component.html',
  styleUrls: ['./pantalla-reportes.component.css']
})
export class PantallaReportesComponent {
   constructor(private auth: AuthService, private router: Router) {}
 logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),  // vuelve a login
      error: () => console.error('Error al cerrar sesión')
    });
  }
}
