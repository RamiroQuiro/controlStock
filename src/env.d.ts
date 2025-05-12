/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    user: {
      id: number;
      nombre: string;
      apellido: string;
      userName: string;
      email: string;
      rol: string;
    } | null;
    session: any; // O define el tipo específico de tu sesión
  }
} 