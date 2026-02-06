import { AuthService } from './../servicios/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
  if (this.auth.usuarioActual) {
    return true;
  } else {
    this.router.navigate(['login']);
    return false;
  }
}

}
