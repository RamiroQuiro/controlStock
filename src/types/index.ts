export type Producto = {
  id: string; // ID único del producto
  nombre: string; // Nombre del producto
  srcPhoto?: string; // URL de la foto del producto
  proveedorId?: string; // ID del proveedor
  codigoBarra: string; // Código de barras del producto
  categoria?: string; // Categoría del producto
  marca?: string; // Marca del producto
  iva: 21 | 10.5 | 27 | 0; // IVA del producto
  impuesto: "21%" | "10.5%" | "27%" | "no aplica"; // Opciones de IVA más comunes en Argentina y "no aplica"
  signoDescuento: '$' | '%'; //signos de descuento si hay , '$' o '%', si es monto o porcentaje
  descuento?: string; // Descuento aplicado al producto "$100" o "10%"
  modelo?: string; // Modelo del producto
  descripcion: string; // Descripción del producto
  pCompra?: number; // Precio de compra del producto
  pVenta?: number ; // Precio de venta del producto
  utilidad?: number; // Utilidad del producto
  stock: number; // Cantidad en stock
  activo: boolean; // Estado del producto (activo/inactivo)
  unidadMedida?: 'unidad' | 'litros' | 'kilogramos'| 'decena'; // Unidad de medida (unidad, kg, litro, etc.)
  precioMinimoVenta?: number; // Precio mínimo de venta del producto
  userUpdate?: string; // ID del usuario que actualizó el producto
  ultimaActualizacion: number; // Timestamp Unix de la última actualización
  created_at: number; // Timestamp Unix de la creación del producto
  userId: string; // ID del usuario que creó el producto
};
export type MovimientoStock = {
  id: string; // ID único del movimiento
  productoId: string; // ID del producto asociado al movimiento
  cantidad: number; // Cantidad involucrada en el movimiento
  tipo: "recarga" | "devolucion" | "vencimiento" | "movimiento"; // Tipo de movimiento
  fecha: string; // Fecha del movimiento (timestamp Unix)
  userId: string; // ID del usuario que realizó el movimiento
  proveedorId?: string; // ID del proveedor (si aplica)
  clienteId?: string; // ID del cliente (si aplica)
  motivo?: string; // Breve razón del movimiento (opcional)
  observacion?: string; // Descripción adicional del movimiento (opcional)
};

export type responseAPIType = {
  msg: string;
  code?: number;
  status?: string;
  body?: string;
};

interface ConfiguracionBackup {
  frecuencia: 'diaria' | 'semanal' | 'mensual';
  destino: 'local' | 'nube';
  compresion: boolean;
  historialBackups: number;
}

interface APIEndpoints {
  // '/api/productos': {
  //   GET: { params: ProductoFiltros, response: Producto[] };
  //   POST: { body: NuevoProducto, response: Producto };
  // };
  // '/api/ventas': {
  //   GET: { params: VentaFiltros, response: Venta[] };
  //   POST: { body: NuevaVenta, response: Venta };
  // };
}


interface CuentaCorriente {
  clienteId: string;
  balance: number;
  limiteCredito: number;
  historialPagos: Pago[];
  estado: 'activo' | 'suspendido';
}

interface CuentaCorriente {
  clienteId: string;
  balance: number;
  limiteCredito: number;
  historialPagos: Pago[];
  estado: 'activo' | 'suspendido';
}

interface Alerta {
  tipo: 'stockBajo' | 'vencimiento' | 'pagosPendientes';
  mensaje: string;
  nivel: 'info' | 'warning' | 'error';
  fecha: Date;
  leida: boolean;
}

export type optionsSelectInputType = {
  id: number;
  value: string;
  name?: string;
};


interface PermisoUsuario {
  rol: 'admin' | 'vendedor' | 'supervisor';
  permisos: {
    ventas: boolean;
    compras: boolean;
    reportes: boolean;
    configuracion: boolean;
  };
  restricciones: {
    maxMontoVenta: number;
    puedeAnular: boolean;
    puedeAplicarDescuentos: boolean;
  };
}

// Implementar caching
const cache = new Map<string, any>();

// Paginación mejorada
interface PaginacionParams {
  pagina: number;
  porPagina: number;
  ordenarPor: string;
  direccion: 'asc' | 'desc';
}
// Interfaces para selects y formularios
export interface IProductoForm {
  nombre: string;
  srcPhoto?: string;
  proveedorId?: string;
  codigoBarra: string;
  categoria?: string;
  marca?: string;
  iva: 21 | 10.5 | 27 | 0;
  impuesto: "21%" | "10.5%" | "27%" | "no aplica";
  signoDescuento: '$' | '%';
  descuento?: string;
  modelo?: string;
  descripcion: string;
  pCompra?: number;
  pVenta?: number;
  utilidad?: number;
  stock: number;
  unidadMedida?: 'unidad' | 'litros' | 'kilogramos' | 'decena';
  precioMinimoVenta?: number;
}

export interface IMovimientoStockForm {
  productoId: string;
  cantidad: number;
  tipo: "recarga" | "devolucion" | "vencimiento" | "movimiento";
  proveedorId?: string;
  clienteId?: string;
  motivo?: string;
  observacion?: string;
}

// Interfaces para las respuestas de la API
export interface IProductoResponse extends IProductoForm {
  id: string;
  activo: boolean;
  userUpdate?: string;
  ultimaActualizacion: number;
  created_at: number;
  userId: string;
}

export interface IMovimientoStockResponse extends IMovimientoStockForm {
  id: string;
  fecha: string;
  userId: string;
}

export type Venta = {
  id: string;
  clienteId?: string; // ID del cliente (opcional para ventas sin cliente registrado)
  fecha: number; // Timestamp de la venta
  total: number; // Monto total de la venta
  descuento?: number; // Descuento total aplicado
  tipoDescuento?: '$' | '%'; // Tipo de descuento aplicado
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago'; // Método de pago
  nComprobante?:string,
  srcComprobante?:string,
  vencimientoCheque?:string,
  nCheque?:string,
  estado?: 'pendiente' | 'completada' | 'cancelada'; // Estado de la venta
  userId: string; // Usuario que realizó la venta
  observaciones?: string; // Notas adicionales
  created_at: number; // Timestamp de creación
};

export type DetalleVenta = {
  id: string;
  ventaId: string; // ID de la venta a la que pertenece
  productoId: string; // ID del producto vendido
  cantidad: number; // Cantidad vendida
  precioUnitario: number; // Precio unitario al momento de la venta
  subtotal: number; // Subtotal (cantidad * precioUnitario)
  descuento?: number; // Descuento aplicado al ítem
  tipoDescuento?: '$' | '%'; // Tipo de descuento del ítem
  iva: number; // IVA aplicado
};

// Interfaces para formularios
export interface IVentaForm {
  clienteId?: string;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago';
  descuento?: number;
  tipoDescuento?: '$' | '%';
  observaciones?: string;
}

export interface IDetalleVentaForm {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  tipoDescuento?: '$' | '%';
}

// Interfaces para respuestas de API
export interface IVentaResponse extends IVentaForm {
  id: string;
  fecha: number;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  userId: string;
  created_at: number;
}

export interface IDetalleVentaResponse extends IDetalleVentaForm {
  id: string;
  ventaId: string;
  subtotal: number;
  iva: number;
}

export interface IPresupuesto {
  id: string;
  codigo: string;  // Código único para búsqueda rápida
  clienteId?: string;
  items: IDetalleVentaForm[];
  subtotal: number;
  descuentos?: number;
  impuestos: {
    iva21?: number;
    iva105?: number;
    iva27?: number;
  };
  total: number;
  observaciones?: string;
  created_at: number;
  expira_at: number;  // Timestamp de expiración (5 días después)
  estado: 'activo' | 'convertido' | 'expirado';
  userId: string;  // Usuario que generó el presupuesto
}


export interface Proveedor {
  id: string;
  nombre: string;
  dni: number;
  celular: string;
  email: string;
  direccion: string;
  categoria: string;
  estado: string;
  observaciones: string;
  fechaAlta: number;
  ultimaCompra: number;
  userId: string;
  created_at:string
}
