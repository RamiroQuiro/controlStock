
export const agregarCeros = (numero: number,longitud:number) => {
  return numero.toString().padStart(longitud, '0');
}
