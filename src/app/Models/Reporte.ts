import { usuario } from './usuario';
import { cliente } from './cliente';
import { actividad } from './actividad';

export interface Reporte {
  titulo?: string;
  descripcionTrabajo: string;
  ubicacion?: string;
  tipoOperacionId?: number;
  observaciones?: string;

  encargado: usuario;
  trabajadores: usuario[];
  cliente: cliente;

  actividades?: actividad[];
  imagenesActividades?: File[];
  
  lecturas?: string;
  imagenesLecturas?: File[];

  nombreSupervisor: string;
  firmaEncargado?: File;
  firmaSupervisor?: File;
}
