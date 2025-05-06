import BotonEditar from "../moleculas/BotonEditar";
import BotonEliminar from "../moleculas/BotonEliminar";
import { dataFormularioContexto } from "../../context/store";
import {
  CircleMinus,
  CirclePlus,
  Copy,
  Delete,
  Edit2,
  Minus,
  MinusCircle,
  Tag,
  Target,
} from "lucide-react";

//   botonera de acciones
export const RenderActionsProductos = (data) => (
  <div className="flex gap-2 pr-5 justify-end items-center text-xs">
    <button
      className="text-primary-100  hover:text-white  px-1 py-0.5 rounded hover:bg-primary-100/80 duration-150"
      onClick={() =>
        (document.location.href = `/dashboard/productos/${data.id}`)
      }
    >
      <Copy className="w-4 h-6" />
    </button>
    <button
      className="text-green-400 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
      onClick={(e) => {
        e.stopPropagation();
        document.location.href = data.href;
      }}
    >
      <CircleMinus className="w-4 h-6" />
    </button>
    <button
      className="text-green-500 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
      onClick={(e) => {
        e.stopPropagation();
        document.location.href = data.href;
      }}
    >
      <CirclePlus className="w-4 h-6" />
    </button>
    <button
      className="text-orange-400 hover:text-white   px-1 py-0.5 rounded hover:bg-orange-400/80 duration-150"
      onClick={(e) => {
        e.stopPropagation();
        alert(`Eliminar: ${data.id}`);
      }}
    >
      <Edit2 className="w-4 h-6" />
    </button>
    <button
      className="bg-primary-400 text-white  px-1 py-0.5 rounded hover:bg-primary-400/80 duration-150"
      onClick={(e) => {
        e.stopPropagation();
        alert(`Eliminar: ${data.id}`);
      }}
    >
      <Delete className="w-4 h-6" />
    </button>
  </div>
);

// botoner para acciones de diagnosticos

//   botonera de acciones
export const RenderActionsVentas = (
  data,
  restarCantidad,
  sumarCantidad,
  aplicaDescuento,
  eliminarProducto
) => {
  return (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <button
        className="text-green-400 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
        onClick={(e) => {
          e.preventDefault();
          restarCantidad(data)();
        }}
      >
        <CircleMinus className="w-4 h-6" />
      </button>
      <button
        className="text-green-500 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
        onClick={(e) => {
          e.preventDefault();
          sumarCantidad(data)();
        }}
      >
        <CirclePlus className="w-4 h-6" />
      </button>
      <button
        className="text-green-500 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
        onClick={(e) => {
          e.preventDefault();
          aplicaDescuento(data)();
        }}
      >
        <Tag className="w-4 h-6" />
      </button>

      <button
        className="bg-primary-400 text-white  px-1 py-0.5 rounded hover:bg-primary-400/80 duration-150"
        onClick={(e) => {
          e.preventDefault();
          eliminarProducto(data)();
        }}
      >
        <Delete className="w-4 h-6" />
      </button>
    </div>
  );
};

export const RenderActionsUsers = (data) => {
  const handleEditModal = (data) => {
    dataFormularioContexto.set({ ...data, isEdit: true });
    const modal = document.getElementById(`dialog-modal-modificarUser`);
    modal.showModal();
  };

  const handleDelet = async ( data ) => {
    console.log(data)
    await fetch("/api/users/editUser", {
      method: "DELETE",
      body: JSON.stringify({
        id:data?.id
      }),
    });
  };

  return (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <BotonEditar handleClick={() => handleEditModal(data)} />
      <BotonEliminar handleClick={() => handleDelet(data)} />
    </div>
  );
};
export const RenderActionsClientes = (data) => {
  const irAPerfilCliente = (data) => {
    window.location.href = `/dashboard/clientes/${data.id}`;
  };

  const handleDelet = async ({ id }) => {
    const newMedicamentos = atencion
      .get()
      .medicamentos.filter((med) => med.id != id);
    atencion.set({
      ...atencion.get(),
      medicamentos: newMedicamentos,
    });
  };

  return (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <button
        className="text-white bg-green-600/70 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
        onClick={() => irAPerfilCliente(data)}
      >
        <Edit2 className="w-4 h-6" />
      </button>
      <button
        className="bg-primary-400 text-white  px-1 py-0.5 rounded hover:bg-primary-400/80 duration-150"
        onClick={(e) => {
          e.stopPropagation();
          alert(`Eliminar: ${data.id}`);
        }}
      >
        <Delete className="w-4 h-6" />
      </button>
    </div>
  );
};

export const RenderActionsProveedores = (data) => {
  const irAPerfilCliente = (data) => {
    window.location.href = `/dashboard/proveedores/${data.id}`;
  };

  const handleDelet = async ({ id }) => {
    const newMedicamentos = atencion
      .get()
      .medicamentos.filter((med) => med.id != id);
    atencion.set({
      ...atencion.get(),
      medicamentos: newMedicamentos,
    });
  };

  return (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <button
        className="text-white bg-green-600/70 hover:text-white   px-1 py-0.5 rounded hover:bg-green-400/80 duration-150"
        onClick={() => irAPerfilCliente(data)}
      >
        <Edit2 className="w-4 h-6" />
      </button>
      <button
        className="bg-primary-400 text-white  px-1 py-0.5 rounded hover:bg-primary-400/80 duration-150"
        onClick={(e) => {
          e.stopPropagation();
          alert(`Eliminar: ${data.id}`);
        }}
      >
        <Delete className="w-4 h-6" />
      </button>
    </div>
  );
};
