import { Usuario } from './Usuario';
import { Cliente } from './Cliente';
import { Actividad } from './Actividad';

export interface Reporte {
  titulo?: string;
  descripcionTrabajo: string;
  ubicacion?: string;
  tipoOperacionId?: number;
  observaciones?: string;

  encargado: Usuario;
  trabajadores: Usuario[];
  cliente: Cliente;

  actividades?: Actividad[];
  imagenesActividades?: File[];
  
  lecturas?: string;
  imagenesLecturas?: File[];

  nombreSupervisor: string;
  firmaEncargado?: File;
  firmaSupervisor?: File;
}
