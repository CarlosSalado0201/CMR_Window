import { Modelos } from './Modelos';

export interface Materiales {
  id?: number;
  nombre: string;
  descripcion?: string;
  unidad?: string;
  cantidad?: number; // puedes usar string si trabajas con BigDecimal como texto
  precioUnitario?: number;
   modelo:Modelos;
   cantidadSeleccionada ?: number;
}