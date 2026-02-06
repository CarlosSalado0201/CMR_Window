import { modelos } from "./modelos";

export interface equipo {
  id: number;
  marca: string;
  precio: number;
  modelo: {
    id: number;
    nombre: string;
    categoria: {
      id: number;
      nombre: string;
    }
  }
}