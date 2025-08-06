import { Modelos } from './../Models/Modelos';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Categoria } from '../Models/Categorias';
import { Equipo } from '../Models/Equipos';
import { Materiales } from '../Models/Materiales';

@Injectable({
  providedIn: 'root' // Este servicio estará disponible globalmente en toda la app
})
export class ServiciosService {

 private URLCategoria = 'https://proyecto-cmr.onrender.com/CategoriasWebService';
private URLEquipo = 'https://proyecto-cmr.onrender.com/EquiposWebService';
private urlMateriales = 'https://proyecto-cmr.onrender.com/MaterialesWebService';
private modelosURL = 'https://proyecto-cmr.onrender.com/ModelosWebService';

  constructor(private http: HttpClient) {}

  // ----------- CATEGORÍAS -----------

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.URLCategoria}/mostrar`).pipe(
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        return of([]);
      })
    );
  }
// En ServiciosService:

guardarCategoria(categoria: { nombre: string }): Observable<string | null> {
  return this.http.post<string>(`${this.URLCategoria}/guardar`, categoria, { observe: 'response' }).pipe(
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


  editarCategoria(categoria: Categoria): Observable<Categoria | null> {
    return this.http.put<Categoria>(`${this.URLCategoria}/editar`, categoria).pipe(
      catchError(error => {
        console.error('Error al editar categoría:', error);
        return of(null);
      })
    );
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLCategoria}/eliminar/${id}`).pipe(
      catchError(error => {
        console.error('Error al eliminar categoría:', error);
        return of();
      })
    );
  }

  buscarCategoriaPorNombre(nombre: string): Observable<Categoria | null> {
    return this.http.get<Categoria>(`${this.URLCategoria}/buscarPorNombre/${nombre}`).pipe(
      catchError(error => {
        console.error('Error al buscar categoría por nombre:', error);
        return of(null);
      })
    );
  }

  // ----------- EQUIPOS -----------

  obtenerEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.URLEquipo}/mostrar`).pipe(
      catchError(error => {
        console.error('Error al obtener equipos:', error);
        return of([]);
      })
    );
  }

  obtenerEquiposPorCategoria(idCategoria: number): Observable<Equipo[]> {
    const categoria = { id: idCategoria };
    return this.http.post<Equipo[]>(`${this.URLEquipo}/buscarPorCategoria`, categoria).pipe(
      catchError(error => {
        console.error('Error al obtener equipos por categoría:', error);
        return of([]);
      })
    );
  }
guardarEquipo(equipo: any): Observable<Equipo | string | null> {
  return this.http.post(`${this.URLEquipo}/guardar`, equipo, { observe: 'response', responseType: 'text' }).pipe(
    map(response => {
      if (response.status === 201) {
        // La respuesta es texto, puedes devolverla o un string fijo
        return response.body ?? 'guardadoConExito';
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


  editarEquipo(equipo: Equipo): Observable<Equipo | null> {
    return this.http.put<Equipo>(`${this.URLEquipo}/editar`, equipo).pipe(
      catchError(error => {
        console.error('Error al editar equipo:', error);
        return of(null);
      })
    );
  }

  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URLEquipo}/eliminar/${id}`).pipe(
      catchError(error => {
        console.error('Error al eliminar equipo:', error);
        return of();
      })
    );
  }

  buscarEquipoPorNombre(nombre: string): Observable<Equipo | null> {
    return this.http.get<Equipo>(`${this.URLEquipo}/buscarPorNombre/${nombre}`).pipe(
      catchError(error => {
        console.error('Error al buscar equipo por nombre:', error);
        return of(null);
      })
    );
  }


obtenerMaterialesPorEquipo(material: Materiales): Observable<Materiales[]> {
  return this.http.post<Materiales[]>(`${this.urlMateriales}/buscarPorEquipoId`, material);
}
// Ejemplo en servicios.service.ts

obtenerMateriales() {
  return this.http.get<Materiales[]>(`${this.urlMateriales}/mostrar`);
}
guardarMaterial(material: any): Observable<Materiales | string | null> {
  return this.http.post<Materiales>(`${this.urlMateriales}/guardar`, material, { observe: 'response' }).pipe(
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
  return this.http.put<boolean>(this.urlMateriales + `/editar`, material);
}

eliminarMaterial(id: number): Observable<void> {
  return this.http.delete<void>(this.urlMateriales + `/eliminar/${id}`);
}
///Modelos//////////////////
// Ya lo tienes
getModelos(): Observable<Modelos[]> {
  return this.http.get<Modelos[]>(`${this.modelosURL}/mostrar`);
}

// Agrégalo:
agregarModelo(modelo: { nombre: string; categoriaId: number }): Observable<Modelos | string | null> {
  const modeloParaEnviar = {
    nombre: modelo.nombre,
    categoria: { id: modelo.categoriaId }
  };

  return this.http.post<Modelos>(`${this.modelosURL}/guardar`, modeloParaEnviar, { observe: 'response' }).pipe(
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
  return this.http.delete<void>(`${this.modelosURL}/eliminar/${id}`).pipe(
    catchError(error => {
      console.error('Error al eliminar modelo:', error);
      return of();
    })
  );
}
editarModelo(modelo: Modelos): Observable<Modelos | null> {
  return this.http.put<Modelos>(`${this.modelosURL}/editar`, modelo).pipe(
    catchError(error => {
      console.error('Error al editar modelo:', error);
      return of(null);
    })
  );
}

// En el servicio Angular
obtenerModelosPorCategoria(categoria: Categoria): Observable<Modelos[]> {
  return this.http.post<Modelos[]>(`${this.modelosURL}/buscarPorCategoria`, categoria);
}
obtenerMaterialesPorModelo(idModelo: number): Observable<Materiales[]> {
  const modelo = { id: idModelo };
  return this.http.post<Materiales[]>(`${this.urlMateriales}/buscarPorModelo`, modelo).pipe(
    catchError(error => {
      console.error('Error al obtener materiales por modelo:', error);
      return of([]);
    })
  );
}
getMaterialesPorModelo(id: number): Observable<Materiales[]> {
  return this.http.post<Materiales[]>(
    'https://proyecto-cmr.onrender.com/MaterialesWebService/buscarPorModelo',
    { modelo: { id } } // El cuerpo esperado por el backend
  );
}

  }
