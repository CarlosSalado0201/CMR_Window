// src/app/Models/equipo-con-cantidad.ts
import { Equipo } from './Equipos';

export interface EquipoConCantidad extends Equipo {
  cantidad: number;
  porcentaje?: number;
  precioFinal?: number;
}
