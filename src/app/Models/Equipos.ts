import { Modelos } from "./Modelos";

export interface Equipo {
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