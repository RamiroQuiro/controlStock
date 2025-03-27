import React, { useEffect, useState } from "react";
import CompraDetalle from "./CompraDetalle";

interface Props {
  compraId: string;
}
interface CompraDetalleProps {
  id: string;
  fecha: string;
  cliente: {
    nombre: string;
    dni: number;
    direccion?: string;
  };
  comprobante: {
    numero: string;
    metodoPago: string;
    nCheque: string;
    vencimientoCheque: string;
  };
  items: Array<{
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    impuesto: number;
    descripcion: string;
  }>;
  totales: {
    subtotal: number;
    impuestos: number;
    descuentos: number;
    total: number;
  };
}

export default function ContenedorVisorCompras({ compraId }: Props) {
  const [compra, setCompra] = useState<CompraDetalleProps>({
    cliente: {
      dni: 0,
      nombre: "",
      direccion: "",
    },
    comprobante: {
      metodoPago: "",
      nCheque: "",
      numero: "",
      vencimientoCheque: "",
    },
    fecha: "",
    id: "",
    items: [],
    totales: {
      descuentos: 0,
      impuestos: 0,
      subtotal: 0,
      total: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const peticionVenta = async () => {
      try {
        const response = await fetch(`/api/compras/${compraId}`, {
          method: "GET",
          headers: {
            "x-user-id": "1",
          },
        });
        const data = await response.json();
        setCompra(data.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    peticionVenta(compraId);
  }, [compraId]);

  return (
    <div className="sticky top-10 left-0 right-0 bottom-0 bg-opacity-50 z-50">
      {loading ? (
        <div className="bg-white px-4 py-6 flex flex-col min-w-60  min-h-[75vh] animate-pulse mx-auto"></div>
      ) : (
        <CompraDetalle {...compra} />
      )}
    </div>
  );
}
