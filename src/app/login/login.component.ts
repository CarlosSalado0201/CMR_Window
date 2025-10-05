import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Servicios/auth.service';
import { ServiciosService } from 'src/app/Servicios/servicios.service';
import { Usuario } from '../Models/Usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMsg = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private serviciosService: ServiciosService,
    private ngZone: NgZone
  ) {}

  login() {
    this.errorMsg = '';

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        // Obtener info del usuario logueado
        this.serviciosService.obtenerUsuarioActual().subscribe({
          next: (info: Usuario) => {
            if (!info || !info.roles || info.roles.length === 0) {
              this.errorMsg = 'No se pudo obtener info del usuario o no tiene roles asignados';
              return;
            }

            // Guardar usuario en AuthService para AuthGuard
            this.auth.setUsuarioActual(info);

            // Navegar dentro de NgZone para asegurar detección de cambios
            this.ngZone.run(() => {
              if (info.roles.includes('ROLE_ADMIN')) {
                this.router.navigate(['/inicio']);
              } else if (info.roles.includes('ROLE_TECNICO')) {
                this.router.navigate(['/reportes']);
              } else {
                this.errorMsg = 'No tienes un rol asignado';
              }
            });
          },
          error: () => this.errorMsg = 'No se pudo obtener info del usuario'
        });
      },
      error: () => this.errorMsg = 'Usuario o contraseña incorrectos'
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => console.error('Error cerrando sesión')
    });
  }
}
