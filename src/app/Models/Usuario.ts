// src/app/Models/Usuario.ts
export interface Usuario {
  id: number;
  nombre: string;
  cargo: string;
  username?: string;   // opcional, útil para login/reporte
  roles: string[];     // nombres de roles para navegación (ROLE_ADMIN, ROLE_TECNICO)
  rolesIds?: number[]; // IDs de roles para lógica interna (1 = Admin, 2 = Técnico)
}
