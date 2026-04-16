type ColumnaType = {
  label: string;
  id: number;
  selector: string | ((row: any, index?: number) => any);
  cell?: (row: any) => any;
};

interface ClienteRow {
  nombre: string;
  dni: number;
  email: string;
  celular: string;
  estado: string;
}

export const clienteColumns: ColumnaType[] = [
  { label: "N°", id: 1, selector: (_row: any, index: number = 0) => index + 1 },
  { label: "nombre", id: 2, selector: "nombre" },
  { label: "dni", id: 3, selector: "dni" },
  { label: "email", id: 4, selector: "email" },
  { label: "celular", id: 5, selector: "celular" },
  { label: "estado", id: 5, selector: "estado" },
];

export const exportacionProductosClomuns = [
  { label: "N°", id: 1, selector: (_row: any, index: number = 0) => index + 1 },
  { label: "Producto", id: 2, selector: "nombreProducto" },
  { label: "Estado", id: 3, selector: "estado" },
  { label: "Mensaje", id: 4, selector: "mensaje" },
];

const columnasResultadosImportacion = [
  {
    label: "Fila",
    id: 1,
    selector: (_row: { [key: string]: any }, index: number = 0) => index + 1,
  },
  {
    label: "Nombre",
    id: 2,
    selector: (row: any) => row.nombre || row.nombreProducto,
  },
  { label: "Estado", id: 3, selector: "estado" },
  { label: "Mensaje", id: 4, selector: "mensaje" },
];

export const columnasResultadosClientes = columnasResultadosImportacion;
export const columnasResultadosProveedores = columnasResultadosImportacion;

export const detallesProductosColumns = [
  { label: "N°", id: 1, selector: (_row: any, index: number = 0) => index + 1 },
  { label: "Tipo", id: 2, selector: "tipo" },
  { label: "Cantidad", id: 3, selector: "cantidad" },
  { label: "Motivo", id: 4, selector: "motivo" },
  { label: "Relacion", id: 5, selector: "efectuado" },
  { label: "Cliente/Proveedor", id: 5, selector: "efectuado" },
  { label: "Fecha", id: 6, selector: "fecha" },
  { label: "Stock Restante", id: 7, selector: "stockRestante" },
];

export const columnasVentasTodas = [
  { label: "N°", id: 1, selector: (_row: any, index: number = 0) => index },
  { label: "N° Comprobante", id: 2, selector: "nComprobante" },
  { label: "Cliente", id: 3, selector: "cliente" },
  { label: "dni", id: 4, selector: "dni" },
  { label: "Tipo de Pago", id: 5, selector: "metodoPago" },
  { label: "Fecha", id: 6, selector: "fecha" },
  { label: "Monto", id: 7, selector: "monto" },
];

export const columnasComprasTodas = [
  { label: "N°", id: 1, selector: (_row: any, index: number = 0) => index + 1 },
  { label: "N° Comprobante", id: 2, selector: "nComprobante" },
  { label: "Proveedor", id: 3, selector: "proveedor" },
  { label: "dni Provee", id: 4, selector: "dniProveedor" },
  { label: "Tipo de Pago", id: 5, selector: "metodoPago" },
  { label: "Fecha", id: 6, selector: "fecha" },
  { label: "Monto", id: 7, selector: "monto" },
];

export const proveedorColumns: ColumnaType[] = [
  { label: "N°", id: 1, selector: (row, index) => index + 1 },
  { label: "Nombre", id: 2, selector: "nombre" },
  { label: "Email", id: 4, selector: "email" },
  { label: "Teléfono", id: 5, selector: "telefono" },
  { label: "Dirección", id: 6, selector: "direccion" },
  { label: "Estado", id: 7, selector: "estado" },
];

export const columnsUltimasTransacciones = [
  { label: "Id", id: 1, selector: "nId" },
  { label: "Fecha", id: 3, selector: "fecha" },
  { label: "Clien/Prov", id: 2, selector: "cliente" },
  { label: "Tipo", id: 6, selector: "tipo" },
  { label: "Monto", id: 4, selector: "total" },
  { label: "Metodo", id: 7, selector: "metodoPago" },
];

export const columnasUsuarios = [
  { label: "N°", id: 1, selector: (_row: any, index: number = 0) => index + 1 },
  { label: "Nombre", id: 2, selector: "nombre" },
  { label: "Apellido", id: 3, selector: "apellido" },
  { label: "DNI", id: 8, selector: "dni" },
  { label: "Email", id: 4, selector: "email" },
  { label: "Rol", id: 5, selector: "rol" },
  { label: "Estado", id: 6, selector: "activo" },
];
