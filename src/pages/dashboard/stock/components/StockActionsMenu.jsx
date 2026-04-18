import React, { useState } from "react";
import {
  ShoppingCart,
  Tags,
  Truck,
  History,
  PackageCheck,
  Menu,
  ChefHat,
  ClipboardList,
} from "lucide-react";
import FormularioModificacionPrecios from "./FormularioModificacionPrecios";
import FormularioCompra from "./FormularioCompra";
import FormularioTraslado from "./Traslados/FormularioTraslado";
import ContenedorRecepcion from "./Traslados/ContenedorRecepcion";
import ContenedorHistorial from "./Traslados/ContenedorHistorial";
import MenuDropbox from "../../../../components/organismos/MenuDropbox";
import ModalReact from "../../../../components/moleculas/ModalReact";



const StockActionsMenu = ({ user, depositos, ubicaciones, permisos }) => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  const tieneLogistica = permisos.puedeTranslado || permisos.puedeRecibirTraslado || permisos.puedeVerHistorial;
  const tienePanaderia = permisos.puedeCrearProduccion || permisos.puedeCrearReceta || permisos.puedeVerRecetas;

  const items = [
    permisos.puedeEditarPrecios && {
      label: "Modificar Precios",
      icon: <Tags size={18} />,
      onClick: () => setActiveModal("modificarPrecios"),
    },
    permisos.puedeComprar && {
      label: "Registrar Compra",
      icon: <ShoppingCart size={18} />,
      onClick: () => setActiveModal("comprar"),
    },
    
    // Panadería (NUEVO)
    tienePanaderia && {
      label: "Producción y Panadería",
      isSeparator: true,
    },
    permisos.puedeCrearProduccion && {
      label: "Registrar Producción",
      icon: <ChefHat size={18} className="text-orange-500" />,
      onClick: () => setActiveModal("produccion"),
    },
    permisos.puedeVerRecetas && {
        label: "Recetas y Fórmulas",
        icon: <ClipboardList size={18} className="text-blue-500" />,
        onClick: () => setActiveModal("recetas"),
    },

    // Logística
    tieneLogistica && {
      label: "Logística y Traslados",
      isSeparator: true,
    },
    permisos.puedeTranslado && depositos.length > 1 && {
      label: "Traslado entre Sucursales",
      icon: <Truck size={18} />,
      onClick: () => setActiveModal("traslados"),
    },
    permisos.puedeRecibirTraslado && {
      label: "Recibir Mercadería",
      icon: <PackageCheck size={18} />,
      onClick: () => setActiveModal("recibir"),
    },
    permisos.puedeVerHistorial && {
      label: "Historial de Traslados",
      icon: <History size={18} />,
      onClick: () => setActiveModal("historial"),
    },
  ].filter(Boolean);

  // Si no hay ninguna acción disponible para el usuario, ni siquiera renderizar el botón
  if (items.length === 0) return null;

  return (
    <>
      <MenuDropbox
        items={items}
        triggerIcon={<Menu className="w-5 h-5" />}
        triggerTitle="Acciones de Stock"
        buttonClassName="bg-white border hover:text-primary-textoTitle border-gray-300 hover:border-gray-200 hover:bg-gray-50 !rounded-md px-3"
      />

      {/* Modales */}

      {/* Modificar Precios */}
      {activeModal === "modificarPrecios" && (
        <ModalReact
          title="Modificar Precios"
          onClose={closeModal}
          className="md:min-w-[60vw]"
        >
          <FormularioModificacionPrecios userId={user.id} dataFiltros={{}} />
        </ModalReact>
      )}

      {/* Registrar Compra */}
      {activeModal === "comprar" && (
        <ModalReact
          title="Registrar Compra"
          onClose={closeModal}
          className="md:min-w-[50vw]"
        >
          <FormularioCompra user={user} empresaId={user.empresaId} />
        </ModalReact>
      )}

      {/* Traslados */}
      {activeModal === "traslados" && (
        <ModalReact
          title="Traslado entre Sucursales"
          onClose={closeModal}
          className="md:min-w-[50vw]"
        >
          <FormularioTraslado
            user={user}
            empresaId={user.empresaId}
            depositos={depositos}
          />
        </ModalReact>
      )}

      {/* Recibir Mercadería */}
      {activeModal === "recibir" && (
        <ModalReact
          title="Recepción de Mercadería"
          onClose={closeModal}
          className="md:min-w-[60vw]"
        >
          <ContenedorRecepcion user={user} />
        </ModalReact>
      )}

      {/* Historial */}
      {activeModal === "historial" && (
        <ModalReact
          title="Historial de Traslados"
          onClose={closeModal}
          className="md:min-w-[70vw]"
        >
          <ContenedorHistorial user={user} />
        </ModalReact>
      )}

      {/* Producción (NUEVO) */}
      {activeModal === "produccion" && (
        <ModalReact
          title="Registrar Producción"
          onClose={closeModal}
          className="md:min-w-[50vw]"
        >
          <div className="p-8 text-center text-gray-500">
             <ChefHat size={48} className="mx-auto mb-4 text-orange-400" />
             <p className="text-xl font-bold">Módulo de Producción</p>
             <p>Aquí el panadero registrará los amasados diarios.</p>
             <p className="text-sm mt-2 italic">(Próximamente)</p>
          </div>
        </ModalReact>
      )}

      {/* Recetas (NUEVO) */}
      {activeModal === "recetas" && (
        <ModalReact
          title="Gestión de Recetas y Fórmulas"
          onClose={closeModal}
          className="md:min-w-[60vw]"
        >
          <div className="p-8 text-center text-gray-500">
             <ClipboardList size={48} className="mx-auto mb-4 text-blue-400" />
             <p className="text-xl font-bold">Gestión de Recetas</p>
             <p>Definición de insumos y rendimientos por producto.</p>
             <p className="text-sm mt-2 italic">(Próximamente)</p>
          </div>
        </ModalReact>
      )}
    </>
  );
};

export default StockActionsMenu;
