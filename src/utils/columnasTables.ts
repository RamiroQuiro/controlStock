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

