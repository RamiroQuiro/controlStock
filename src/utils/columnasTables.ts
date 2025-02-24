type ColumnaType = {
    label: string;
    id: number;
    selector: (row: any, index?: number) => any;
}

interface ClienteRow {
    codigoBarra: string;
    descripcion: string;
    categoria: string;
    pCompra: number;
}

export const clienteColumns: ColumnaType[] = [
    { label: 'N°', id: 1, selector: (row, index) => index + 1},
    { label: 'nombre', id: 2, selector: (row: ClienteRow) => row.codigoBarra },
    { label: 'dni', id: 3, selector: (row: ClienteRow) => row.descripcion },
    { label: 'email', id: 4, selector: (row: ClienteRow) => row.categoria },
    { label: 'celular', id: 5, selector: (row: ClienteRow) => row.pCompra },
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