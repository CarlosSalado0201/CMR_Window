import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../Models/Usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://proyecto-cmr.onrender.com/api'; // URL del backend en Render

  public usuarioActual: Usuario | null = null;

  constructor(private http: HttpClient) {}

  // ------------------------
  // LOGIN
  // ------------------------
  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post(`${this.apiUrl}/login`, body.toString(), {
      withCredentials: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  // ------------------------
  // LOGOUT
  // ------------------------
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {} );
  }

  // ------------------------
  // INFO DEL USUARIO
  // ------------------------
  obtenerInfoUsuario(): Observable<{ username: string; roles: number[] }> {
    return this.http.get<{ username: string; roles: number[] }>(`${this.apiUrl}/usuario/info` );
  }

  getToken(): string | null {
    return this.usuarioActual ? 'ok' : null;
  }

  setUsuarioActual(usuario: Usuario) {
    this.usuarioActual = usuario;
  }

  // ------------------------
  // CLIENTES
  // ------------------------
  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes/lista` );
  }

  // ------------------------
  // TIPOS DE OPERACIÓN
  // ------------------------
  obtenerTiposOperacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-operacion` );
  }

  // ------------------------
  // ACTIVIDADES POR TIPO
  // ------------------------
  obtenerActividadesPorTipo(idTipoOperacion: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/actividades/tipo/${idTipoOperacion}` );
  }
}
