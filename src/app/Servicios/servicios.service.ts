  import { modelos } from './../models/modelos';
  import { Injectable } from '@angular/core';
  import { HttpClient, HttpResponse } from '@angular/common/http';
  import { catchError, map, Observable, of } from 'rxjs';
  import { categoria } from '../models/categorias';
  import { equipo } from '../models/equipos';
  import { materiales } from '../models/materiales';
  import { cliente } from '../models/cliente';
  import { actividad } from '../models/actividad';
import { cartaPayload } from '../models/modalCartaComponent';

  @Injectable({
    providedIn: 'root' // Este servicio estará disponible globalmente en toda la app
  })

  export class serviciosService {

  private URLCategoria = 'https://proyecto-cmr.onrender.com/CategoriasWebService';
  private URLEquipo = 'https://proyecto-cmr.onrender.com/EquiposWebService';
  private urlMateriales = 'https://proyecto-cmr.onrender.com/MaterialesWebService';
  private modelosURL = 'https://proyecto-cmr.onrender.com/ModelosWebService';
  private loginUrl = 'https://proyecto-cmr.onrender.com/api/login';

    constructor(private http: HttpClient) {}
    // ---------------- LOGIN -----------------
    login(username: string, password: string, rememberMe: boolean) {
  const body = new URLSearchParams();
  body.set('username', username);
  body.set('password', password);
  body.set('rememberMe', rememberMe.toString());

  return this.http.post('https://proyecto-cmr.onrender.com/api/login', body.toString(), {
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    observe: 'response'
  });
}


    // ----------- CATEGORÍAS -----------

    obtenerCategorias(): Observable<categoria[]> {
      return this.http.get<categoria[]>(`${this.URLCategoria}/mostrar` ).pipe(
        catchError(error => {
          console.error('Error al obtener categorías:', error);
          return of([]);
        })
      );
    }
  // En ServiciosService:

  guardarCategoria(categoria: { nombre: string }): Observable<string | null> {
    return this.http.post<string>(`${this.URLCategoria}/guardar`, categoria, { observe: 'response', withCredentials: true }).pipe(
      map(response => {
        if (response.status === 201) {
          return response.body ?? 'guardadoConExito';
        }
        return null;
      }),
      catchError(error => {
        if (error.status === 201) {
          return of('guardadoConExito');
        }
        if (error.status === 409) {
          return of('nombreYaExiste');
        }
        console.error('Error al guardar categoría:', error);
        return of(null);
      })
    );
  }


    editarCategoria(categoria: categoria): Observable<categoria | null> {
      return this.http.put<categoria>(`${this.URLCategoria}/editar`, categoria ).pipe(
        catchError(error => {
          console.error('Error al editar categoría:', error);
          return of(null);
        })
      );
    }

    eliminarCategoria(id: number): Observable<void> {
      return this.http.delete<void>(`${this.URLCategoria}/eliminar/${id}` ).pipe(
        catchError(error => {
          console.error('Error al eliminar categoría:', error);
          return of();
        })
      );
    }

    buscarCategoriaPorNombre(nombre: string): Observable<categoria | null> {
      return this.http.get<categoria>(`${this.URLCategoria}/buscarPorNombre/${nombre}` ).pipe(
        catchError(error => {
          console.error('Error al buscar categoría por nombre:', error);
          return of(null);
        })
      );
    }

    // ----------- EQUIPOS -----------

    obtenerEquipos(): Observable<equipo[]> {
      return this.http.get<equipo[]>(`${this.URLEquipo}/mostrar` ).pipe(
        catchError(error => {
          console.error('Error al obtener equipos:', error);
          return of([]);
        })
      );
    }

    obtenerEquiposPorCategoria(idCategoria: number): Observable<equipo[]> {
      const categoria = { id: idCategoria };
      return this.http.post<equipo[]>(`${this.URLEquipo}/buscarPorCategoria`, categoria ).pipe(
        catchError(error => {
          console.error('Error al obtener equipos por categoría:', error);
          return of([]);
        })
      );
    }
  guardarEquipo(equipo: any): Observable<equipo | string | null> {
    return this.http.post(`${this.URLEquipo}/guardar`, equipo, { observe: 'response', responseType: 'text', withCredentials: true }).pipe(
      map(response => {
        if ((response as any).status === 201) {
          // La respuesta es texto, puedes devolverla o un string fijo
          return (response as any).body ?? 'guardadoConExito';
        }
        return null;
      }),
      catchError(error => {
        if (error.status === 409) {
          return of('nombreYaExiste');
        }
        console.error('Error al guardar equipo:', error);
        return of(null);
      })
    );
  }


    editarEquipo(equipo: equipo): Observable<equipo | null> {
      return this.http.put<equipo>(`${this.URLEquipo}/editar`, equipo ).pipe(
        catchError(error => {
          console.error('Error al editar equipo:', error);
          return of(null);
        })
      );
    }

    eliminarEquipo(id: number): Observable<void> {
      return this.http.delete<void>(`${this.URLEquipo}/eliminar/${id}` ).pipe(
        catchError(error => {
          console.error('Error al eliminar equipo:', error);
          return of();
        })
      );
    }

    buscarEquipoPorNombre(nombre: string): Observable<equipo | null> {
      return this.http.get<equipo>(`${this.URLEquipo}/buscarPorNombre/${nombre}` ).pipe(
        catchError(error => {
          console.error('Error al buscar equipo por nombre:', error);
          return of(null);
        })
      );
    }


  obtenerMaterialesPorEquipo(material: materiales): Observable<materiales[]> {
    return this.http.post<materiales[]>(`${this.urlMateriales}/buscarPorEquipoId`, material );
  }
  // Ejemplo en servicios.service.ts

  obtenerMateriales() {
    return this.http.get<materiales[]>(`${this.urlMateriales}/mostrar` );
  }
  guardarMaterial(material: any): Observable<materiales | string | null> {
    return this.http.post<materiales>(`${this.urlMateriales}/guardar`, material, { observe: 'response', withCredentials: true }).pipe(
      map(response => {
        if (response.status === 201) {
          return response.body ?? 'guardadoConExito';
        }
        return null;
      }),
      catchError(error => {
        if (error.status === 409) {
          return of('nombreYaExiste');
        }
        console.error('Error al guardar material:', error);
        return of(null);
      })
    );
  }


  editarMaterial(material: any): Observable<boolean> {
    return this.http.put<boolean>(this.urlMateriales + `/editar`, material );
  }

  eliminarMaterial(id: number): Observable<void> {
    return this.http.delete<void>(this.urlMateriales + `/eliminar/${id}` );
  }
  ///Modelos//////////////////
  // Ya lo tienes
  getModelos(): Observable<modelos[]> {
    return this.http.get<modelos[]>(`${this.modelosURL}/mostrar` );
  }

  // Agrégalo:
  agregarModelo(modelo: { nombre: string; categoriaId: number }): Observable<modelos | string | null> {
    const modeloParaEnviar = {
      nombre: modelo.nombre,
      categoria: { id: modelo.categoriaId }
    };

    return this.http.post<modelos>(`${this.modelosURL}/guardar`, modeloParaEnviar, { observe: 'response', withCredentials: true }).pipe(
      map(response => {
        if (response.status === 201) {
          return response.body ?? 'guardadoConExito';
        }
        return null;
      }),
      catchError(error => {
        if (error.status === 409) {
          return of('nombreYaExiste');
        }
        console.error('Error al guardar modelo:', error);
        return of(null);
      })
    );
  }

  // Obtener todos los modelos

  eliminarModelo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.modelosURL}/eliminar/${id}` ).pipe(
      catchError(error => {
        console.error('Error al eliminar modelo:', error);
        return of();
      })
    );
  }
  editarModelo(modelo: modelos): Observable<modelos | null> {
    return this.http.put<modelos>(`${this.modelosURL}/editar`, modelo ).pipe(
      catchError(error => {
        console.error('Error al editar modelo:', error);
        return of(null);
      })
    );
  }

  // En el servicio Angular
  obtenerModelosPorCategoria(categoria: categoria): Observable<modelos[]> {
    return this.http.post<modelos[]>(`${this.modelosURL}/buscarPorCategoria`, categoria );
  }
  obtenerMaterialesPorModelo(idModelo: number): Observable<materiales[]> {
    const modelo = { id: idModelo };
    return this.http.post<materiales[]>(`${this.urlMateriales}/buscarPorModelo`, modelo ).pipe(
      catchError(error => {
        console.error('Error al obtener materiales por modelo:', error);
        return of([]);
      })
    );
  }
  getMaterialesPorModelo(id: number): Observable<materiales[]> {
    return this.http.post<materiales[]>(
      'https://proyecto-cmr.onrender.com/MaterialesWebService/buscarPorModelo',
      { modelo: { id } }, // El cuerpo esperado por el backend
      { withCredentials: true }
    );
  }
  // Método para obtener todos los reportes
  obtenerReportes(): Observable<any[]> {
    return this.http.get<any[]>('https://proyecto-cmr.onrender.com/api/reportes' );
  }

    // ---------------- CLIENTES -----------------
    private URLClientes = 'https://proyecto-cmr.onrender.com/api/clientes';

    // Obtener todos los clientes
    obtenerClientes(): Observable<any[]> {
      return this.http.get<any[]>(`${this.URLClientes}/lista` ).pipe(
        catchError(error => {
          console.error('Error al obtener clientes:', error);
          return of([]);
        })
      );
    }

  // Guardar un nuevo cliente
  guardarCliente(cliente: any): Observable<string | null> {
    return this.http.post<string>(`${this.URLClientes}/guardar`, cliente, { observe: 'response', withCredentials: true }).pipe(
      map(response => {
        if (response.status === 201) {
          return response.body ?? 'guardadoConExito';
        }
        return null;
      }),
      catchError(error => {
        if (error.status === 409) {
          return of('nombreYaExiste');
        }
        console.error('Error al guardar cliente:', error);
        return of(null);
      })
    );
  }

  // Editar cliente
  editarCliente(cliente: any): Observable<any | null> {
    return this.http.put<any>(`${this.URLClientes}/editar`, cliente ).pipe(
      catchError(error => {
        console.error('Error al editar cliente:', error);
        return of(null);
      })
    );
  }

  // Eliminar cliente
  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLClientes}/eliminar/${id}` ).pipe(
      catchError(error => {
        console.error('Error al eliminar cliente:', error);
        return of();
      })
    );
  }

  // Buscar cliente por nombre
  buscarClientePorNombre(nombre: string): Observable<any | null> {
    return this.http.get<any>(`${this.URLClientes}/buscarPorNombre/${nombre}` ).pipe(
      catchError(error => {
        console.error('Error al buscar cliente por nombre:', error);
        return of(null);
      })
    );
  }
  // ---------------- USUARIOS / TRABAJADORES -----------------
  private URLUsuarios = 'https://proyecto-cmr.onrender.com/api/usuario';
  // Servicio para obtener usuario actual
  obtenerUsuarioActual(): Observable<any> {
    return this.http.get<any>(`${this.URLUsuarios}/info` ).pipe(
      catchError(error => {
        console.error('Error al obtener usuario actual:', error);
        return of(null);
      })
    );
  }





  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URLUsuarios}/lista` ).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return of([]);
      })
    );
  }



  // Guardar un nuevo usuario
  guardarUsuario(usuario: any): Observable<string | null> {
    return this.http.post<string>(`${this.URLUsuarios}/guardar`, usuario, { observe: 'response', withCredentials: true }).pipe(
      map(response => {
        if (response.status === 201) return response.body ?? 'guardadoConExito';
        return null;
      }),
      catchError(error => {
        if (error.status === 409) return of('nombreYaExiste');
        console.error('Error al guardar usuario:', error);
        return of(null);
      })
    );
  }

  // Editar usuario
  editarUsuario(usuario: any): Observable<any | null> {
    return this.http.put<any>(`${this.URLUsuarios}/editar`, usuario ).pipe(
      catchError(error => {
        console.error('Error al editar usuario:', error);
        return of(null);
      })
    );
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLUsuarios}/eliminar/${id}` ).pipe(
      catchError(error => {
        console.error('Error al eliminar usuario:', error);
        return of();
      })
    );
  }

  // Buscar usuario por nombre
  buscarUsuarioPorNombre(nombre: string): Observable<any | null> {
    return this.http.get<any>(`${this.URLUsuarios}/buscarPorNombre/${nombre}` ).pipe(
      catchError(error => {
        console.error('Error al buscar usuario por nombre:', error);
        return of(null);
      })
    );
  }
  // ==========================================================
  // 🧱 TIPO DE OPERACIÓN Y ACTIVIDADES
  // ==========================================================
  private apiUrl = 'https://proyecto-cmr.onrender.com/api';


  obtenerTiposOperacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-operacion` );
  }

  obtenerActividadesPorTipo(idTipoOperacion: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/actividades/tipo/${idTipoOperacion}` );
  }
// ==========================================================
// 📄 GENERAR REPORTE (PDF)
// ==========================================================
generarReporte(
  encargado: any,
  trabajadores: any[],
  clienteId: number[], // ✅ CAMBIO: ahora es 1 solo cliente
  descripcion: string,
  tipoEquipo: string,
  imagenesDescripcion: File[],
  firma: File | null,
  actividades: number[],
  nombreSupervisor: string,
  firmaSupervisor: File | null,
  imagenesLecturas: File[],
  ubicacion: string,
  lecturas: string,
  observaciones: string,
  fechaInicio: string,
  fechaFin: string,
  idCarpeta: number | null
): Observable<any> {

  const url = `${this.apiUrl}/reportes/generar`;
  const formData = new FormData();

  // -------- JSON --------
  formData.append('encargado', JSON.stringify(encargado));
  formData.append('trabajadores', JSON.stringify(trabajadores));

  // ✅ CLIENTE ÚNICO (OBLIGATORIO)
  formData.append('clienteId', clienteId.toString());

  formData.append('descripcion', descripcion);
  formData.append('tipoEquipo', tipoEquipo); // ✅ aquí se envía
  formData.append('ubicacion', ubicacion);
  formData.append('lecturas', lecturas ?? '');
  formData.append('observaciones', observaciones ?? '');
  formData.append('fechaInicio', fechaInicio);
  formData.append('fechaFin', fechaFin);
  formData.append('idCarpeta', idCarpeta!.toString());

  actividades.forEach(a =>
    formData.append('actividades', a.toString())
  );

  // -------- firma encargado --------
  if (firma) {
    formData.append('firma', firma);
  }

  // -------- supervisor --------
  formData.append('nombreSupervisor', nombreSupervisor);

  if (firmaSupervisor) {
    formData.append('firmaSupervisor', firmaSupervisor);
  }

  // -------- imágenes descripción --------
  if (imagenesDescripcion?.length) {
    imagenesDescripcion.forEach(img =>
      formData.append('imagenesDescripcion', img, img.name)
    );
  }

  // -------- imágenes lecturas --------
  if (imagenesLecturas?.length) {
    imagenesLecturas.forEach(img =>
      formData.append('imagenesLecturas', img, img.name)
    );
  }

  return this.http.post(url, formData, { withCredentials: true });
}
// ---------------- CARPETAS -----------------
private URLCarpetas = 'https://proyecto-cmr.onrender.com/api/carpeta';

obtenerCarpetas(): Observable<any[]> {
  return this.http.get<any[]>(`${this.URLCarpetas}/listar`).pipe(
    catchError(error => {
      console.error('Error al obtener carpetas:', error);
      return of([]);
    })
  );
}
// ---------------- CARTAS -----------------
private URLCartas = 'https://proyecto-cmr.onrender.com/api/cartas';

generarCarta(payload: cartaPayload): Observable<string | null> {
  return this.http.post<string>(
    `${this.URLCartas}/generar`,
    payload,
    {
      responseType: 'text' as any, // Angular pide este "truco"
      withCredentials: true,
    }
  ).pipe(
    catchError(err => {
      console.error('Error al generar carta:', err);
      return of(null);
    })
  );
}
private baseUrl = 'https://proyecto-cmr.onrender.com';
  obtenerHistorialReportesPorDia(fechaISO: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/api/reportes/historial-dia`,
      { params: { fecha: fechaISO }, withCredentials: true }
    );
  }

  obtenerHistorialCartasPorDia(fechaISO: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/api/cartas/historial-dia`,
      { params: { fecha: fechaISO }, withCredentials: true }
    );
  }
}
    


