export interface CartaPayload {
  tipo: 'entrega' | 'garantia' | 'conjunto';
  preguntasEntrega?: string[];
  respuestasEntrega?: string[];
  preguntasGarantia?: string[];
  respuestasGarantia?: string[];
  idCarpeta: number;
}
