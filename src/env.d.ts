/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    user: {
      id: string;
      nombre: string;
      apellido: string;
      userName: string;
      email: string;
      clienteDefault: string;
      proveedorDefault: string;
      empresaId: string;
      rol: string;
    } | null;
    session: any; // O define el tipo específico de tu sesión
  }
}
