import React from "react";
import ReactQueryProvider from "../../../../../../context/ReactQueryProvider";
import FormProducto from "./FormProducto";
import TablaStockDepositos from "../../../components/TablaStockDepositos";
import HistorialMovimientosDetalleProducto from "../../../components/HistorialMovimientosDetalleProducto";

type Props = {
  data: any;
};

export default function PerfilProductoWrapper({ data }: Props) {
  return (
    <ReactQueryProvider>
      <div className="flex w-full items-center flex-col gap-4 p-8 justify-between">
        <FormProducto data={data} />
        
        <div className="w-full">
          <TablaStockDepositos stockDetalle={data?.stockDetalle} />
        </div>
        
        <HistorialMovimientosDetalleProducto productoId={data?.productData?.id} />
      </div>
    </ReactQueryProvider>
  );
}
