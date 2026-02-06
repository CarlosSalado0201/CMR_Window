// src/app/Models/equipo-con-cantidad.ts
import { equipo } from './equipos';

export interface equipoConCantidad extends equipo {
  cantidad: number;
  porcentaje?: number;
  precioFinal?: number;
}
