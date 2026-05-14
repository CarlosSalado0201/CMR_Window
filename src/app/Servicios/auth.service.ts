import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://proyecto-cmr.onrender.com/api';

  public usuarioActual: usuario | null = null;

  constructor(private http: HttpClient) {}

  // ------------------------
  // LOGIN
  // ------------------------
  login(username: string, password: string): Observable<any> {

    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post(
      `${this.apiUrl}/login`,
      body.toString(),
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  }

  // ------------------------
  // LOGOUT
  // ------------------------
  logout(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true
      }
    );
  }

  // ------------------------
  // INFO DEL USUARIO
  // ------------------------
  obtenerInfoUsuario(): Observable<{ username: string; roles: string[] }> {

    return this.http.get<{ username: string; roles: string[] }>(
      `${this.apiUrl}/usuario/info`,
      {
        withCredentials: true
      }
    );
  }

  // ------------------------
  // TOKEN
  // ------------------------
  getToken(): string | null {
    return this.usuarioActual ? 'ok' : null;
  }

  // ------------------------
  // GUARDAR USUARIO
  // ------------------------
  setUsuarioActual(usuario: usuario) {
    this.usuarioActual = usuario;
  }

  // ------------------------
  // CLIENTES
  // ------------------------
  obtenerClientes(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/clientes/lista`,
      {
        withCredentials: true
      }
    );
  }

  // ------------------------
  // TIPOS OPERACION
  // ------------------------
  obtenerTiposOperacion(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/tipos-operacion`,
      {
        withCredentials: true
      }
    );
  }

  // ------------------------
  // ACTIVIDADES
  // ------------------------
  obtenerActividadesPorTipo(idTipoOperacion: number): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/actividades/tipo/${idTipoOperacion}`,
      {
        withCredentials: true
      }
    );
  }
}