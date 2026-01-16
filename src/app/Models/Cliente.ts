export interface Cliente {
  id: number;
  nombre: string;
  identificacion: string;
  email: string;
  direccion: string;
  telefono: string;
  responsable: string;
  ultimaVisita?: string; // puede venir como string desde el backend
  estatus: string;
}
