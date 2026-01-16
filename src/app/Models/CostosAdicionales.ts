export interface CostosAdicionales {
  numeroTrabajadores: number;
  sueldoPorTrabajador: number;
  imssPorTrabajador: number;
  ubicacion: 'ciudad' | 'fuera' | '';
  distancia?: '500' | '1000' | '1500' | '';
  gasolinaPorDia?: number;
  tagsPorDia?: number;
  viaticosPorDia?: number;
}
