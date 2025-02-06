import React, { useState } from "react";
import ConfirmacionVenta from "./ConfirmacionVenta";
import Ticket from "../../../../components/organismos/ticket";

export default function ModalConfirmacion({
  setModalConfirmacion,
  finalizarCompra,
  productos,
  totalVenta,
  ticketOk
}) {
const [loading, setLoading] = useState(false)


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[60] flex justify-center items-center">
      <div className="bg-white pt-4 pb-2 px-5 rounded-lg w-1/3 h2/3">
      {
       !ticketOk?<ConfirmacionVenta setModalConfirmacion={setModalConfirmacion} finalizarCompra={finalizarCompra} productos={productos} totalVenta={totalVenta} />
       :
       <Ticket productos={productos} setModalConfirmacion={setModalConfirmacion}/>
       }
      </div>
    </div>
  );
}
