type ColumnaType = {
    label: string;
    id: number;
    selector: (row: any, index?: number) => any;
}

interface ClienteRow {
    nombre: string;
    dni: number;
    email: string;
    celular: string;
    estado: string;
}

export const clienteColumns: ColumnaType[] = [
    { label: 'N°', id: 1, selector: (row, index) => index + 1},
    { label: 'nombre', id: 2, selector: (row: ClienteRow) => row.nombre },
    { label: 'dni', id: 3, selector: (row: ClienteRow) => row.dni },
    { label: 'email', id: 4, selector: (row: ClienteRow) => row.email },
    { label: 'celular', id: 5, selector: (row: ClienteRow) => row.celular },
    { label: 'estado', id: 5, selector: (row: ClienteRow) => row.estado },
    {label:'acciones',id:6,selector:()=>{}}
]

export const detallesProductosColumns = [
    { label: "N°", id: 1, selector: (row, index) => index + 1 },
    { label: "Tipo", id: 2, selector: (row) => row.tipo },
    { label: "Cantidad", id: 3, selector: (row) => row.cantidad },
    { label: "Motivo", id: 4, selector: (row) => row.motivo },
    { label: "Cliente/Proveedor", id: 5, selector: (row) => row.efectuado },
    { label: "Fecha", id: 6, selector: (row) => row.fecha },
    { label: "Stock Restante", id: 7, selector: (row) => row.stockRestante },
  ];
  export const columnasVentasTodas = [
    { label: "N°", id: 1, selector: (row, index) => index + 1 },
    { label: "N° Comprobante", id: 2, selector: (row) =>row.nComprobante},
    { label: "Cliente", id: 3, selector: (row) => row.nombreCliente },
    { label: "dni Cliente", id: 4, selector: (row) => row.dniCliente },
    { label: "Tipo de Pago", id: 5, selector: (row) => row.metodoPago },
    { label: "Fecha", id: 6, selector: (row) => row.fecha },
    { label: "Monto", id: 7, selector: (row) => row.monto },
    { label: "Acciones", id: 8, selector: '' },

  ];
  // Agregar esto al archivo columnasTables.js

interface ProveedorRow {
    nombre: string;
    ruc: string;
    email: string;
    telefono: string;
    direccion: string;
    estado: string;
}

export const proveedorColumns: ColumnaType[] = [
    { label: 'N°', id: 1, selector: (row, index) => index + 1 },
    { label: 'Nombre', id: 2, selector: (row: ProveedorRow) => row.nombre },
    { label: 'RUC', id: 3, selector: (row: ProveedorRow) => row.ruc },
    { label: 'Email', id: 4, selector: (row: ProveedorRow) => row.email },
    { label: 'Teléfono', id: 5, selector: (row: ProveedorRow) => row.telefono },
    { label: 'Dirección', id: 6, selector: (row: ProveedorRow) => row.direccion },
    { label: 'Estado', id: 7, selector: (row: ProveedorRow) => row.estado },
    { label: 'Acciones', id: 8, selector: () => {} }
];