import { modelos } from './modelos';

export interface materiales {
  id?: number;
  nombre: string;
  descripcion?: string;
  unidad?: string;
  cantidad?: number; // puedes usar string si trabajas con BigDecimal como texto
  precioUnitario?: number;
   modelo:modelos;
   cantidadSeleccionada ?: number;
}