import React, { useState } from 'react';
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx';
import BtnBusquedaCliente from './BtnBusquedaCliente';
import ModalCliente from './ModalCliente';
import BusquedaClientes from './BusquedaClientes';

export default function ClientesSelect({ cliente, setCliente, userId }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {openModal && (
        <ModalCliente onClose={() => setOpenModal(false)}>
          <BusquedaClientes
            onClose={setOpenModal}
            setCliente={setCliente}
            userId={userId}
          />
        </ModalCliente>
      )}
      <div className="w-full  text-base capitalize inline-flex gap-3">
        <InputComponenteJsx
          name={'cliente'}
          value={cliente?.nombre}
          type={'text'}
        />
        <BtnBusquedaCliente
          cliente={cliente}
          onClick={() => setOpenModal(true)}
        />
      </div>
    </>
  );
}
