import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../Models/Usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  
// Servicio login
login(username: string, password: string): Observable<any> {
  const body = new HttpParams()
    .set('username', username)
    .set('password', password);

  return this.http.post('http://localhost:8080/api/login', body.toString(), {
    withCredentials: true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}
  logout(): Observable<any> {
    return this.http.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
  }
obtenerInfoUsuario(): Observable<{ username: string; roles: number[] }> {
  return this.http.get<{ username: string; roles: number[] }>('http://localhost:8080/api/usuario/info', { withCredentials: true });
}
  getToken(): string | null {
    // Si hay usuario logueado, permitimos navegar
    return this.usuarioActual ? 'ok' : null;
  }
public usuarioActual: Usuario | null = null;
 // Guardar usuario logueado
  setUsuarioActual(usuario: Usuario) {
    this.usuarioActual = usuario;
  }


}
