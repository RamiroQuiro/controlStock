import type { APIRoute } from 'astro';
import { clientes } from '../../../db/schema/clientes';
import db from '../../../db';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const clientesData = await db.select().from(clientes).where(eq(clientes.userId,"1"))

    // Cabeceras del CSV
    const headers = [
      'Nombre',
      'DNI',
      'Teléfono',
      'Email',
      'Dirección',
      'Categoría',
      'Estado',
      'Límite de Crédito',
      'Saldo Pendiente',
      'Fecha de Alta',
      'Última Compra',
      'Observaciones'
    ].join(',');

    // Convertir datos a filas CSV
    const rows = clientesData.map(cliente => [
      cliente.nombre.replace(/,/g, ' '), // Evitar conflictos con comas
      cliente.dni,
      cliente.telefono || '',
      cliente.email || '',
      (cliente.direccion || '').replace(/,/g, ' '),
      cliente.categoria,
      cliente.estado,
      cliente.limiteCredito,
      cliente.saldoPendiente,
      new Date(cliente.fechaAlta * 1000).toLocaleDateString(),
      cliente.ultimaCompra ? new Date(cliente.ultimaCompra * 1000).toLocaleDateString() : '',
      (cliente.observaciones || '').replace(/,/g, ' ')
    ].join(','));

    // Combinar cabeceras y filas
    const csv = [headers, ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=clientes-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error('Error al exportar clientes:', error);
    return new Response(
      JSON.stringify({ message: 'Error al exportar clientes' }), 
      { status: 500 }
    );
  }
}; 