
export type Producto = {
  id: string; // ID único del producto
  nombre: string; // Nombre del producto
  srcPhoto?: string; // URL de la foto del producto
  proveedorId?: string; // ID del proveedor
  codigoBarra: string; // Código de barras del producto
  categoria?: string; // Categoría del producto
  marca?: string; // Marca del producto
  impuesto: "21%" | "10.5%" | "27%" | "no aplica"; // Opciones de IVA más comunes en Argentina y "no aplica"
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

export type optionsSelectInputType = {
  id: number;
  value: string;
  name?: string;
};

export interface Antecedente {
  atecedente: string;
  fechaDiagnostico: string;
  estado: string;
  observacion?: string;
  descripcion?: string;
  tipo: 'personal' | 'familiar';
  condicion?: boolean;
}

export interface AntecedentesMedicosProps {
  antedecentes: Antecedente[];
}

export interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
  estado: 'activo' | 'completado' | 'suspendido';
}

export interface MedicationsProps {
  medications: Medication[];
}
export interface Documentos {
  nombre: string;
  tipo: 'laboratorios' | 'rayosx' | 'prescripcion' | 'electrocardiograma' | 'otros' | 'derivacion';
  fecha: string;
  tamaño: string;
  estado: 'pendiente' | 'revisar' | 'archivado';
  src: string;
}



export interface DocumentosAdjuntosProps {
  documentos: Documentos[];
}
