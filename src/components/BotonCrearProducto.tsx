
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Modal from './Modal';
import FormularioCrearProducto from './FormularioCrearProducto';
import Button3 from './atomos/Button3';

// Este componente asume que tienes props como `userId` y `empresaId`
// disponibles en la página donde lo vayas a usar.
interface Props {
  userId: string;
  empresaId: string;
  onProductCreated: () => void; // Callback para refrescar la lista de productos
}

export default function BotonCrearProducto({ userId, empresaId, onProductCreated }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
    onProductCreated(); // Llama al callback para refrescar datos en la página padre
  };

  return (
    <div>
      <Button3 onClick={() => setIsModalOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Crear Producto
      </Button3>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FormularioCrearProducto
          userId={userId}
          empresaId={empresaId}
          onClose={handleClose}
        />
      </Modal>
    </div>
  );
}
