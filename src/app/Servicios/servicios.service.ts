import { Modelos } from './../Models/Modelos';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Categoria } from '../Models/Categorias';
import { Equipo } from '../Models/Equipos';
import { Materiales } from '../Models/Materiales';
import { Cliente } from '../Models/Cliente';
import { Actividad } from '../Models/Actividad';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  private URLCategoria = 'https://proyecto-cmr.onrender.com/CategoriasWebService';
  private URLEquipo = 'https://proyecto-cmr.onrender.com/EquiposWebService';
  private urlMateriales = 'https://proyecto-cmr.onrender.com/MaterialesWebService';
  private modelosURL = 'https://proyecto-cmr.onrender.com/ModelosWebService';
  private loginUrl = 'http://localhost:8080/api/login';
  private URLClientes = 'http://localhost:8080/api/clientes';
  private URLUsuarios = 'http://localhost:8080/api/usuario';
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ---------------- LOGIN -----------------
  login(username: string, password: string, rememberMe: boolean): Observable<HttpResponse<any>> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    body.set('rememberMe', rememberMe.toString());

    return this.http.post(this.loginUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true, // ✅ Safari: necesario para guardar cookie JSESSIONID
      observe: 'response'
    });
  }

  // ----------- CATEGORÍAS -----------
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.URLCategoria}/mostrar`, {
      withCredentials: true // ✅ Safari
    }).pipe(
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        return of([]);
      })
    );
  }

  guardarCategoria(categoria: { nombre: string }): Observable<string | null> {
    return this.http.post<string>(`${this.URLCategoria}/guardar`, categoria, {
      observe: 'response',
      withCredentials: true // ✅ Safari
    }).pipe(
      map(response => {
        if (response.status === 201) return response.body ?? 'guardadoConExito';
        return null;
      }),
      catchError(error => {
        if (error.status === 409) return of('nombreYaExiste');
        console.error('Error al guardar categoría:', error);
        return of(null);
      })
    );
  }

  editarCategoria(categoria: Categoria): Observable<Categoria | null> {
    return this.http.put<Categoria>(`${this.URLCategoria}/editar`, categoria, {
      withCredentials: true // ✅ Safari
    }).pipe(
      catchError(() => of(null))
    );
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLCategoria}/eliminar/${id}`, {
      withCredentials: true // ✅ Safari
    }).pipe(catchError(() => of()));
  }

  // ----------- EQUIPOS -----------
  obtenerEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.URLEquipo}/mostrar`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  obtenerEquiposPorCategoria(idCategoria: number): Observable<Equipo[]> {
    return this.http.post<Equipo[]>(`${this.URLEquipo}/buscarPorCategoria`, { id: idCategoria }, {
      withCredentials: true // ✅ Safari
    }).pipe(catchError(() => of([])));
  }

  guardarEquipo(equipo: any): Observable<Equipo | string | null> {
    return this.http.post(`${this.URLEquipo}/guardar`, equipo, {
      observe: 'response',
      responseType: 'text',
      withCredentials: true // ✅ Safari
    }).pipe(
      map(response => response.status === 201 ? response.body ?? 'guardadoConExito' : null),
      catchError(error => {
        if (error.status === 409) return of('nombreYaExiste');
        console.error('Error al guardar equipo:', error);
        return of(null);
      })
    );
  }

  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLEquipo}/eliminar/${id}`, { withCredentials: true }).pipe(
      catchError(() => of())
    );
  }

  // ----------- MATERIALES -----------
  obtenerMateriales(): Observable<Materiales[]> {
    return this.http.get<Materiales[]>(`${this.urlMateriales}/mostrar`, {
      withCredentials: true // ✅ Safari
    });
  }

  guardarMaterial(material: any): Observable<Materiales | string | null> {
    return this.http.post<Materiales>(`${this.urlMateriales}/guardar`, material, {
      observe: 'response',
      withCredentials: true // ✅ Safari
    }).pipe(
      map(response => response.status === 201 ? response.body ?? 'guardadoConExito' : null),
      catchError(error => {
        if (error.status === 409) return of('nombreYaExiste');
        console.error('Error al guardar material:', error);
        return of(null);
      })
    );
  }

  // ----------- REPORTES -----------
  generarReporte(
    encargado: any,
    trabajadores: any[],
    cliente: any,
    descripcion: string,
    imagenes: File[] = [],
    firma: File | null = null,
    actividades: number[] = [],
    nombreSupervisor: string,
    firmaSupervisor: File | null
  ): Observable<any> {
    const formData = new FormData();
    formData.append('encargado', JSON.stringify(encargado));
    formData.append('trabajadores', JSON.stringify(trabajadores));
    formData.append('cliente', JSON.stringify(cliente));
    formData.append('descripcion', descripcion);
    if (actividades) actividades.forEach(id => formData.append('actividades', id.toString()));
    if (imagenes) imagenes.forEach(img => formData.append('imagenes', img, img.name));
    if (firma) formData.append('firma', firma, firma.name);
    formData.append('nombreSupervisor', nombreSupervisor);
    if (firmaSupervisor) formData.append('firmaSupervisor', firmaSupervisor, firmaSupervisor.name);

    return this.http.post<{ urlPdf: string }>('http://localhost:8080/api/reportes/generar', formData, {
      withCredentials: true // ✅ Safari: cookies al generar reporte
    });
  }

  obtenerReportes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/reportes', {
      withCredentials: true // ✅ Safari
    }).pipe(
      catchError(() => of([]))
    );
  }

  // ----------- CLIENTES -----------
  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URLClientes}/lista`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  guardarCliente(cliente: any): Observable<string | null> {
    return this.http.post<string>(`${this.URLClientes}/guardar`, cliente, {
      observe: 'response',
      withCredentials: true // ✅ Safari
    }).pipe(
      map(response => response.status === 201 ? response.body ?? 'guardadoConExito' : null),
      catchError(error => {
        if (error.status === 409) return of('nombreYaExiste');
        console.error('Error al guardar cliente:', error);
        return of(null);
      })
    );
  }

  // ----------- USUARIOS -----------
  obtenerUsuarioActual(): Observable<any> {
    return this.http.get<any>(`${this.URLUsuarios}/info`, { withCredentials: true }).pipe(
      catchError(() => of(null))
    );
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URLUsuarios}/lista`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  guardarUsuario(usuario: any): Observable<string | null> {
    return this.http.post<string>(`${this.URLUsuarios}/guardar`, usuario, {
      observe: 'response',
      withCredentials: true // ✅ Safari
    }).pipe(
      map(response => response.status === 201 ? response.body ?? 'guardadoConExito' : null),
      catchError(error => {
        if (error.status === 409) return of('nombreYaExiste');
        console.error('Error al guardar usuario:', error);
        return of(null);
      })
    );
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLUsuarios}/eliminar/${id}`, {
      withCredentials: true // ✅ Safari
    }).pipe(catchError(() => of()));
  }

  // ----------- TIPO DE OPERACIÓN / ACTIVIDADES -----------
  obtenerTiposOperacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-operacion`, { withCredentials: true });
  }

  obtenerActividadesPorTipo(idTipoOperacion: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/actividades/tipo/${idTipoOperacion}`, {
      withCredentials: true // ✅ Safari
    });
  }
}

