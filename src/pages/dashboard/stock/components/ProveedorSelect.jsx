import React, { useState } from 'react'
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx'
import BusquedaProveedor from './BusquedaProveedor'
import BtnBusquedaCliente from '../../ventas/components/BtnBusquedaCliente'
import ModalCliente from '../../ventas/components/ModalCliente'

export default function ProveedorSelect({proveedor, setProveedor}) {
const [openModal, setOpenModal] = useState(false)

  return (
    <>
     {openModal && (
        <ModalCliente onClose={() => setOpenModal(false)}>
          <BusquedaProveedor
            onClose={setOpenModal}
            setProveedor={setProveedor}
          />
        </ModalCliente>
      )}
    <div className="w-full  text-base capitalize inline-flex gap-3">
    <InputComponenteJsx
      name={"proveedor"}
      value={proveedor?.nombre}
      type={"text"}
      />
    <BtnBusquedaCliente
      cliente={proveedor}
      onClick={(e) =>{e.preventDefault(); setOpenModal(true)}}
      />
  </div>
      </>
  )
}
