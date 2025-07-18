const formatDate = (fecha, tipo = 0) => {
  let date;

  // ✅ Si ya es Date, usalo directamente
  if (fecha instanceof Date) {
    date = fecha;
  } 
  // ✅ Si es timestamp en segundos (número chico)
  else if (typeof fecha === 'number' && fecha < 1e12) {
    date = new Date(fecha * 1000); // lo pasás a milisegundos
  }
  // ✅ Si es timestamp en milisegundos (número grande)
  else if (typeof fecha === 'number') {
    date = new Date(fecha);
  }
  // ✅ Si es string, parsealo
  else {
    date = new Date(fecha);
  }

  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return tipo === 1
    ? date.toLocaleDateString('es-AR')
    : date.toLocaleDateString('es-AR', opciones);
};

export default formatDate;
