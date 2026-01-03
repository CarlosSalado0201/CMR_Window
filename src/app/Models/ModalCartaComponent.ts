export interface CartaPayload {
  tipo: 'entrega' | 'garantia' | 'conjunto';
  idCarpeta: number;

  preguntasEntrega?: string[];
  respuestasEntrega?: string[];

  preguntasGarantia?: string[];
  respuestasGarantia?: string[];

  // ✅ quien entrega / recibe
  quienEntrega?: string;
  cargoEntrega?: string;
  quienRecibe?: string;
  cargoRecibe?: string;

  // ✅ firmas base64 PNG (solo base64, sin "data:image/png;base64,")
  firmaEntrega?: string | null;
  firmaRecibe?: string | null;
}
