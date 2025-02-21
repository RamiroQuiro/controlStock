import React, { useState } from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import { Search } from "lucide-react";

export default function BtnBusquedaCliente({ handleCliente, cliente, onClick}) {
  return (
   
      <button onClick={onClick}    id={"btnBusquedaCliente"} className="bg-primary-400 focus:border-primary-100 border focus:ring text-white flex items-center justify-center px-1 w-12 py-0.5 rounded-full hover:bg-primary-400/80 duration-150">
        <Search className="w-6 h-6" />
      </button>
  );
}
