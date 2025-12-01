import React, { useState } from "react";
import {
  PackagePlus,
  ShoppingCart,
  Tags,
  Truck,
  ArrowRightLeft,
  ClipboardList,
  History,
  PackageCheck,
  Menu,
} from "lucide-react";
import FormularioModificacionPrecios from "./FormularioModificacionPrecios";
import FormularioCompra from "./FormularioCompra";
import FormularioTraslado from "./Traslados/FormularioTraslado";
import FormularioSolicitud from "./Traslados/FormularioSolicitud";
import TablaSolicitudes from "./Traslados/TablaSolicitudes";
import ContenedorRecepcion from "./Traslados/ContenedorRecepcion";
import ContenedorHistorial from "./Traslados/ContenedorHistorial";
import MenuDropbox from "../../../../components/organismos/MenuDropbox";
import ModalReact from "../../../../components/moleculas/ModalReact";

// Importamos los formularios
// Nota: En Astro, los componentes .astro no se pueden importar directamente en React.
// Necesitaremos usar los componentes React equivalentes o wrappers si son .astro.
// Por ahora asumiremos que los formularios son componentes React o que podemos adaptarlos.
// Si son .astro, tendremos que mantenerlos en Stock.astro y controlar su visibilidad via props,
// pero el plan aprobada sugiere usar un wrapper React.
// Verificaremos qué formularios son React puros.

// FormularioCargaProducto es .astro, así que necesitaremos una estrategia diferente para él
// o asumir que hay una versión React. Por ahora usaremos un placeholder o lo omitiremos del menú React
// y lo dejaremos como botón separado si es estrictamente necesario, o mejor aún,
// convertiremos la llamada a un componente React si es posible.
// Revisando imports en Stock.astro: import FormularioCargaProducto from "../../productos/components/FormularioCargaProducto.astro";
// Al ser .astro, no puede renderizarse dentro de este componente React.
// ESTRATEGIA: Este componente manejará los modales de componentes REACT.
// Para el componente .astro, emitiremos un evento o lo manejaremos desde fuera.
// O MEJOR: El usuario aceptó el plan de "Crear StockActionsMenu.jsx".
// Si FormularioCargaProducto es .astro, no podemos meterlo aquí.
// Vamos a excluir "Crear Producto" de este menú por ahora o manejarlo via evento custom.

const StockActionsMenu = ({ user, depositos, ubicaciones, permisos }) => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  const items = [
    // Gestión de Productos

    // {
    //   label: "Crear Nuevo Producto",
    //   icon: <PackagePlus size={18} />,
    //   onClick: () => setActiveModal("crearProducto"), // Esto requeriría refactorizar FormularioCargaProducto a React
    // },
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

    // Logística
    {
      label: "Logística y Traslados",
      isSeparator: true,
    },
    depositos.length > 1 && {
      label: "Traslado entre Sucursales",
      icon: <Truck size={18} />,
      onClick: () => setActiveModal("traslados"),
    },
    depositos.length > 1 && {
      label: "Solicitar Mercadería",
      icon: <ArrowRightLeft size={18} />,
      onClick: () => setActiveModal("solicitar"),
    },
    depositos.length > 1 && {
      label: "Gestionar Solicitudes",
      icon: <ClipboardList size={18} />,
      onClick: () => setActiveModal("gestionarSolicitudes"),
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
  ].filter(Boolean); // Filtrar items nulos/falsos

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

      {/* Solicitar Mercadería */}
      {activeModal === "solicitar" && (
        <ModalReact
          title="Solicitar Mercadería"
          onClose={closeModal}
          className="md:min-w-[50vw]"
        >
          <FormularioSolicitud
            user={user}
            empresaId={user.empresaId}
            depositos={depositos}
          />
        </ModalReact>
      )}

      {/* Gestionar Solicitudes */}
      {activeModal === "gestionarSolicitudes" && (
        <ModalReact
          title="Gestionar Solicitudes de Mercadería"
          onClose={closeModal}
          className="md:min-w-[70vw]"
        >
          <TablaSolicitudes user={user} />
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
    </>
  );
};

export default StockActionsMenu;
