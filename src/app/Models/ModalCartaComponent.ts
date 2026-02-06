export interface cartaPayload {
  tipo: 'entrega' | 'garantia' | 'conjunto';
  idCarpeta: number;

  preguntasEntrega?: string[];
  respuestasEntrega?: string[];

  preguntasGarantia?: string[];
  respuestasGarantia?: string[];

  // ✅ firmas
  quienEntrega?: string;
  cargoEntrega?: string;
  quienRecibe?: string;
  cargoRecibe?: string;
  firmaEntrega?: string | null; // base64 puro
  firmaRecibe?: string | null;  // base64 puro

  // ✅ clientes
   clientesIds?: number[];
  
}
