export async function toggleEcommerceProduct(id:string, isEcommerce:boolean) {
    try {
      const response = await fetch(`/api/productos/tiendaOnline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isEcommerce }),
      });
  
      const dataRes = await response.json();
      return dataRes;
    } catch (error) {
      console.error("Error en toggleEcommerceProduct:", error);
      return { status: 500, msg: "Error de conexión con el servidor" };
    }
  }
  
  // productosService.js
export async function obtenerPronostico(productId:string) {
    const res = await fetch(`/api/productos/${productId}/pronostico`);
    if (!res.ok) throw new Error('Error al obtener pronóstico');
    return await res.json();
  }
  
  export async function eliminarProducto(productId:string) {
    const res = await fetch(`/api/productos/productos?search=${productId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar producto');
    return await res.json();
  }
  
  export async function actualizarProducto(productId:string, formulario:any, srcPhoto:string) {
    const res = await fetch(`/api/productos/productos?search=${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        srcPhoto
      },
      body: JSON.stringify(formulario),
    });
    return await res.json();
  }
  
  export async function descargarPDF(productId:string, userId:string) {
    const res = await fetch(`/api/productos/generarPdf/${productId}`, {
      method: 'GET',
      headers: { 'xx-user-id': userId }
    });
    if (!res.ok) throw new Error('Error al generar PDF');
    return await res.blob();
  }
  