import Table from "../tablaComponentes/Table";
import formatDate from "../../utils/formatDate";
import DivReact from "../atomos/DivReact";
import {
  ArrowRightLeft,
  DollarSign,
  LucideLineChart,
  SendToBack,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formateoMoneda } from "../../utils/formateoMoneda";

export default function PerfilProducto({ infoProducto }) {
  const columnas = [
    { label: "N°", id: 1, selector: (row, index) => "N°" },
    { label: "Tipo", id: 2, selector: (row) => row.tipo },
    { label: "Cantidad", id: 3, selector: (row) => row.cantidad },
    { label: "Motivo", id: 3, selector: (row) => row.motivo },
    { label: "cliente/proveed", id: 5, selector: (row) => row.proveed },
    { label: "Fecha", id: 6, selector: (row) => row.fecha },
  ];

  const newArray = infoProducto.stockMovimiento?.map((mov, i) => {
    const stockInicial = mov?.motivo === "StockInicial";

    if (stockInicial) {
      console.log('este es el movimiento del stcock actualk',mov);
    }
    const efectuado = mov.tipo == "egreso" ? "clienteId" : "productoId";
    const fecha = formatDate(mov.fecha);
    const esEgreso = mov.tipo === "egreso";
    const stockActual=esEgreso?stockInicial-mov.cantidad:stockInicial+mov.cantidad;
    console.log(stockActual);
    return {
      "N°": i + 1,
      tipo:
        mov.tipo === "ingreso" ? (
          <p className="flex items-center justify gap-2 text-green-600 normal">
            <TrendingUp className="h-4 w-4" /> ingreso
          </p>
        ) : (
          <p className="flex text-primary-400 items-center justify-normal gap-2">
            <TrendingDown className="h-4 w-4" /> egreso
          </p>
        ),
      cantidad: mov.cantidad,
      motivo: mov.motivo,
      efectuado: mov.tipo == "egreso" ? mov.clienteId : mov.proveedorId,
      fecha: fecha,
      stockRestante: stockActual,
    };
  });

  const totalStockProducto =
    infoProducto.productData?.pVenta * infoProducto.productData?.stock;

  const margenGanancia =
    ((infoProducto.productData?.pVenta - infoProducto.productData?.pCompra) /
      infoProducto.productData?.pCompra) *
    100;

  const ultimaRepo =
    infoProducto.stockMovimiento.filter((mov) => mov.tipo === "ingreso")[0]
      ?.fecha || null;

  return (
    <div className="w-full flex flex-col  px-3 -translate-y-5 rounded-lg items-stretch  ">
      <h2 className="text-lg font-semibold mb-3 text-primary-textoTitle">
        Detalle del Producto
      </h2>
      <div className="flex flex-col w-full -mt- items-center justify-normal gap-3">
        <DivReact>
          {/* Sección de imagen */}
          <div className="flex items-start justify-normal gap-3">
            <div className="w-full flex flex-col md:w-[60%] items-center justify-start relative rounded-lg overflow-hidden ">
              <div className="h-[80%] flex w-full rounded-lg  items-center ">
                <img
                  src={infoProducto.productData?.srcPhoto}
                  alt={infoProducto.productData?.descripcion}
                  className=" object-cover w-full h-60 rounded-lg overflow-hidden hover:scale-105 duration-500"
                />
              </div>
            </div>

            {/* Sección de detalles */}
            <div className="w-full md:w-1/3 flex text-sm flex-col relative gap-">
              <div className="flex flex-col gap-1">
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Codigo/ID:</span>
                  <p className="font-medium text-primary-textoTitle">
                    {" "}
                    {infoProducto.productData?.id}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Descripción:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.descripcion}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Categoria:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.categoria}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Localización:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.localizacion}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Marca:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.marca}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Stock:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.stock}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Alerta de Stock:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.alertaStock}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Codigo de Barra:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.codigoBarra}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Ultima Reposición:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {formatDate(ultimaRepo)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DivReact>
        <DivReact>
          <div className="w-full flex items-center justify-around">
            <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
              <div className="flex items-center gap-1">
                <DollarSign className="stroke-primary-100" />
                <p className="text-primary-textoTitle">Precio de Costo</p>
              </div>
              <p className=" font-bold text-2xl trakin text-primary-textoTitle">
                {formateoMoneda.format(infoProducto.productData?.pCompra)}
              </p>
            </div>
            <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
              <div className="flex items-center gap-1">
                <DollarSign className="stroke-primary-100" />
                <p className="text-primary-textoTitle">Precio de Venta</p>
              </div>
              <p className=" font-bold text-2xl trakin text-primary-textoTitle">
                {formateoMoneda.format(infoProducto.productData?.pVenta)}
              </p>
            </div>
            <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
              <div className="flex items-center gap-1">
                <SendToBack className="stroke-primary-100" />
                <p className="text-primary-textoTitle">Precio Stock</p>
              </div>
              <p className=" font-bold text-2xl trakin text-primary-textoTitle">
                {formateoMoneda.format(totalStockProducto)}
              </p>
            </div>
            <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
              <div className="flex items-center gap-1">
                <LucideLineChart className="stroke-primary-100" />
                <p className="text-primary-textoTitle">Margen Ganancia</p>
              </div>
              <p className=" font-bold text-2xl trakin text-primary-textoTitle">
                %{margenGanancia.toFixed(2)}
              </p>
            </div>
          </div>
        </DivReact>
        {/* Historial de movimiento */}
        <DivReact>
          <h3 className="flex  items-center gap-4 text-lg font-semibold text-gray-700 mb-2">
            <ArrowRightLeft /> Historial de Movimiento
          </h3>
          <Table arrayBody={newArray} columnas={columnas} />
        </DivReact>
      </div>
    </div>
  );
}
