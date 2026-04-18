import { useState, useEffect, useRef, useCallback } from "react";
import { busqueda, filtroBusqueda } from "../../context/venta.store";
import {
  CheckCircle,
  XCircle,
  LoaderCircle,
  Search,
  Barcode,
  Type,
  Zap,
  AlertCircle,
  Scan,
  Camera,
} from "lucide-react";
import { cache } from "../../utils/cache";
import { formateoMoneda } from "../../utils/formateoMoneda";
import BarcodeScanner from "./BarcodeScanner"; // Importar Scanner

// Debounce hook para mejor performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
export default function FiltroProductosV3({
  mostrarProductos,
  userId,
  empresaId,
  modoCompra = false,
  onProductoAgregado = null,
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [encontrados, setEncontrados] = useState([]);
  const [agregarAutomatico, setAgregarAutomatico] = useState(true);
  const [tipoBusqueda, setTipoBusqueda] = useState(null);
  const [estado, setEstado] = useState("inicial");
  const [ultimaBusqueda, setUltimaBusqueda] = useState("");
  const [productoAgregado, setProductoAgregado] = useState(null);
  const [mostrarScanner, setMostrarScanner] = useState(false); // Estado para el scanner

  const inputRef = useRef(null);
  const debouncedSearch = useDebounce(search, 300);

  // Debug del estado
  useEffect(() => {
    console.log("Estado agregarAutomatico:", agregarAutomatico);
  }, [agregarAutomatico]);

  // Auto-focus
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      busqueda.set({ productosBuscados: null });
    };
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      handleBusqueda(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      limpiarBusqueda();
    }
  }, [debouncedSearch]);

  const detectarTipoBusqueda = (query) => {
    // Si tiene espacios, es texto (ej: "Coca Cola")
    if (/\s/.test(query)) {
      return "texto";
    }
    // Si NO tiene espacios, asumimos que puede ser un código (ej: "123", "A123", "Coca")
    return "codigo";
  };

  const handleBusqueda = async (query) => {
    console.log("🔍 Iniciando búsqueda:", {
      query,
      agregarAutomatico,
      tipo: detectarTipoBusqueda(query),
    });

    if (query === ultimaBusqueda) return;

    setUltimaBusqueda(query);
    setLoading(true);
    setEstado("buscando");

    const tipo = detectarTipoBusqueda(query);
    setTipoBusqueda(tipo);

    try {
      // ⚖️ LÓGICA DE BALANZA (EAN-13 Variable)
      // Ejemplo: 20 00105 00750 2 -> Prefijo 20, PLU 105, Peso 0.750kg
      if (
        query.length === 13 &&
        (query.startsWith("20") || query.startsWith("02"))
      ) {
        console.log("Detectado código de BALANZA");
        const plu = query.substring(2, 7); // 5 dígitos del PLU
        const pesoRaw = query.substring(7, 12); // 5 dígitos del Peso
        const pesoCalculado = parseInt(pesoRaw) / 1000; // Asumimos 3 decimales (estándar)

        console.log("Buscando por PLU:", plu, "Peso:", pesoCalculado);

        const resPlu = await fetch(
          `/api/productos/productos?search=${plu}&tipo=codigoPlu`,
          {
            method: "GET",
            headers: {
              "x-user-id": userId,
              "xx-empresa-id": empresaId,
              "Content-Type": "application/json",
            },
          },
        );

        const dataPlu = await resPlu.json();

        if (dataPlu.data && dataPlu.data.length > 0) {
          const producto = dataPlu.data[0];
          console.log("Producto de balanza encontrado:", producto.nombre);
          setProductoAgregado(producto);
          setEstado("agregando");
          setTimeout(() => {
            handleClick(producto, pesoCalculado);
          }, 100);
          return;
        }
      }

      if (agregarAutomatico && tipo === "codigo") {
        console.log("Búsqueda EXACTA por código activada");

        const resExacta = await fetch(
          `/api/productos/productos?search=${query}&tipo=codigoBarra`,
          {
            method: "GET",
            headers: {
              "x-user-id": userId,
              "xx-empresa-id": empresaId,
              "Content-Type": "application/json",
            },
          },
        );

        const dataExacta = await resExacta.json();
        console.log("Resultado búsqueda exacta:", dataExacta);

        if (dataExacta.data && dataExacta.data.length > 0) {
          const producto = dataExacta.data[0];
          const stock = producto.stock?.cantidad ?? producto.stock ?? 0;

          console.log("Producto encontrado - Stock:", stock);

          if (modoCompra || stock > 0) {
            console.log("AUTO-AGREGANDO PRODUCTO:", producto.nombre);
            setProductoAgregado(producto);
            setEstado("agregando");

            setTimeout(() => {
              handleClick(producto);
            }, 100);
            return;
          } else {
            console.log("❌ Producto sin stock");
            alert(`❌ ${producto.nombre} no tiene stock disponible`);
          }
        } else {
          console.log("❌ No se encontró producto por código exacto");
        }
      }

      console.log("Realizando búsqueda normal FTS");
      const resFTS = await fetch(
        `/api/productos/buscar-fts?search=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "xx-user-id": userId,
            "Content-Type": "application/json",
          },
        },
      );

      const dataFTS = await resFTS.json();
      console.log("Resultados FTS:", dataFTS.data);

      if (dataFTS.data && dataFTS.data.length > 0) {
        setEstado("resultados");
        setEncontrados(dataFTS.data);
        busqueda.set({ productosBuscados: dataFTS.data });
      } else {
        setEstado("vacio");
        setEncontrados([]);
        busqueda.set({ productosBuscados: null });
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setEstado("error");
      setEncontrados([]);
      busqueda.set({ productosBuscados: null });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoAgregar = (e) => {
    const nuevoValor = e.target.checked;
    console.log("Checkbox cambiado a:", nuevoValor);
    setAgregarAutomatico(nuevoValor);
  };

  const limpiarBusqueda = () => {
    setSearch("");
    setEncontrados([]);
    setTipoBusqueda(null);
    setEstado("inicial");
    setUltimaBusqueda("");
    setProductoAgregado(null);
    busqueda.set({ productosBuscados: null });

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClick = (producto, overrideCantidad = null) => {
    console.log("🛒 Agregando producto:", producto.nombre);

    const processedProduct = {
      ...producto,
      stock: producto.stock?.cantidad ?? producto.stock ?? 0,
      ...(modoCompra && { pCompra: producto.pCompra || 0 }),
    };

    if (onProductoAgregado) {
      if (overrideCantidad) {
        // Si viene un peso de balanza
        onProductoAgregado(processedProduct, overrideCantidad);
      } else {
        onProductoAgregado(processedProduct);
      }
    } else {
      // Si usa el store directo (filtroBusqueda es un atom que dispara un efecto)
      // Ajustamos el objeto para que el consumidor sepa la cantidad
      filtroBusqueda.set({
        filtro: { ...processedProduct, cantidadManual: overrideCantidad },
      });
    }

    setEstado("agregado");
    setProductoAgregado(producto);

    setTimeout(() => {
      limpiarBusqueda();
    }, 800);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      limpiarBusqueda();
    }
    if (e.key === "Enter" && encontrados.length === 1 && !loading) {
      const producto = encontrados[0];
      const stock = producto.stock?.cantidad ?? producto.stock ?? 0;
      if (modoCompra || stock > 0) {
        handleClick(producto);
      }
    }
  };

  // 🆕 MANEJAR SCANNER - Limpiar input rápido después de auto-agregar
  useEffect(() => {
    if (estado === "agregado" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [estado]);

  // Manejador del escaneo
  const handleScan = (code) => {
    console.log("📸 Código escaneado:", code);
    setMostrarScanner(false);
    setSearch(code);
  };

  const stats = {
    total: encontrados.length,
    conStock: encontrados.filter((p) => {
      const stock = p.stock?.cantidad ?? p.stock ?? 0;
      return stock > 0;
    }).length,
    sinStock: encontrados.filter((p) => {
      const stock = p.stock?.cantidad ?? p.stock ?? 0;
      return stock <= 0;
    }).length,
  };

  return (
    <div className="w-full flex flex-col relative">
      {/* Scanner Modal */}
      {mostrarScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setMostrarScanner(false)}
        />
      )}

      {/* Header con controles */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="checkbox"
              id="agregarAutomatico"
              checked={agregarAutomatico}
              onChange={handleToggleAutoAgregar}
              className="sr-only peer"
            />
            <label
              htmlFor="agregarAutomatico"
              className={`flex items-center gap-2 text-xs cursor-pointer select-none transition-all duration-200 ${
                agregarAutomatico ? "text-green-600" : "text-gray-500"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  agregarAutomatico
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                {agregarAutomatico && <CheckCircle size={12} />}
              </div>
              Auto-agregar por código
            </label>
          </div>
        </div>

        {tipoBusqueda && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              tipoBusqueda === "codigo"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {tipoBusqueda === "codigo" ? (
              <Barcode size={12} />
            ) : (
              <Type size={12} />
            )}
            {tipoBusqueda === "codigo" ? "Código" : "Texto"}
          </div>
        )}
      </div>

      {/* Input de búsqueda con estados */}
      <div className="relative flex gap-2">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            id="busquedaProducto"
            placeholder="Escanee código o busque por nombre..."
            value={search}
            type="search"
            className="w-full text-sm bg-white rounded-lg px-4 py-3 border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              borderColor:
                estado === "error"
                  ? "#ef4444"
                  : estado === "agregado"
                    ? "#10b981"
                    : estado === "agregando"
                      ? "#f59e0b"
                      : "#d1d5db",
            }}
            autoComplete="off"
            spellCheck="false"
            // 🆕 IMPORTANTE para scanner - no perder foco
            onBlur={(e) => {
              // Solo prevenir blur si está auto-agregando
              if (estado === "agregando") {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
          />

          {/* Iconos del input */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <LoaderCircle size={18} className="animate-spin text-blue-500" />
            )}

            {estado === "agregando" && (
              <LoaderCircle size={18} className="animate-spin text-amber-500" />
            )}

            {estado === "error" && (
              <AlertCircle size={18} className="text-red-500" />
            )}

            {estado === "agregado" && (
              <CheckCircle size={18} className="text-green-500 animate-pulse" />
            )}

            {search && !loading && estado !== "agregando" && (
              <button
                onClick={limpiarBusqueda}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Botón de Scanner */}
        <button
          onClick={() => setMostrarScanner(true)}
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
          title="Escanear código de barras"
        >
          <Camera size={20} />
        </button>
      </div>

      {/* Estado de auto-agregando */}
      {estado === "agregando" && productoAgregado && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-4">
            <div className="flex items-center gap-3 text-amber-800">
              <LoaderCircle size={20} className="animate-spin" />
              <div>
                <p className="font-medium">Auto-agregando producto...</p>
                <p className="text-sm">{productoAgregado.nombre}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de agregado exitoso */}
      {estado === "agregado" && productoAgregado && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-green-50 border border-green-200 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-4">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle size={20} className="text-green-500" />
              <div>
                <p className="font-medium">¡Producto agregado!</p>
                <p className="text-sm">{productoAgregado.nombre}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Resultados */}
      {mostrarProductos && estado === "resultados" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl z-50 animate-fade-in max-h-80 overflow-hidden">
          {/* Header de resultados */}
          <div className="border-b bg-gray-50 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-gray-600" />
                <span className="text-sm font-medium">
                  {stats.total} producto{stats.total !== 1 ? "s" : ""}{" "}
                  encontrado{stats.total !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {stats.conStock > 0 && (
                  <span className="text-green-600">
                    {stats.conStock} con stock
                  </span>
                )}
                {stats.sinStock > 0 && (
                  <span className="text-red-500">
                    {stats.sinStock} sin stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lista de resultados */}
          <div className="overflow-y-auto max-h-64">
            {encontrados.map((producto, index) => {
              const stock = producto.stock?.cantidad ?? producto.stock ?? 0;
              const tieneStock = stock > 0;
              // 🆕 En modo compra, permitir agregar productos sin stock
              const puedeAgregar = modoCompra || tieneStock;

              return (
                <div
                  key={producto.id}
                  className={`border-b last:border-b-0 transition-colors cursor-pointer group ${
                    puedeAgregar
                      ? "hover:bg-blue-50 focus:bg-blue-50"
                      : "bg-gray-50 opacity-60 cursor-not-allowed"
                  }`}
                  onClick={() => puedeAgregar && handleClick(producto)}
                  tabIndex={puedeAgregar ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && puedeAgregar) {
                      handleClick(producto);
                    }
                  }}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-medium truncate ${
                              tieneStock ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {producto.nombre}
                          </h3>
                          {!tieneStock && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              Sin stock
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Barcode size={10} />
                            <span>{producto.codigoBarra}</span>
                          </div>

                          {producto.marca && (
                            <div className="flex items-center gap-1">
                              <Type size={10} />
                              <span>{producto.marca}</span>
                            </div>
                          )}

                          {producto.descripcion && (
                            <p className="truncate">{producto.descripcion}</p>
                          )}
                        </div>
                      </div>

                      {/* Precio y stock */}
                      <div className="text-right whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {modoCompra
                            ? formateoMoneda.format(producto.pCompra || 0)
                            : formateoMoneda.format(producto.pVenta || 0)}
                        </div>
                        <div className="text-xs text-gray-400 leading-none">
                          {modoCompra ? "costo" : "precio"}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${
                            tieneStock
                              ? "text-gray-500"
                              : "text-red-500 font-semibold"
                          }`}
                        >
                          Stock: {stock}
                        </div>
                        {/* 🆕 Desglose por sucursal para admin */}
                        {Array.isArray(producto.stock?.stockPorDeposito) &&
                          producto.stock.stockPorDeposito.length > 1 && (
                            <div className="mt-1 text-left text-[10px] text-blue-600 border-t border-blue-100 pt-1 space-y-0.5">
                              {producto.stock.stockPorDeposito.map((dep) => (
                                <div
                                  key={dep.depositoId}
                                  className="flex items-center justify-between gap-1"
                                >
                                  <span className="truncate max-w-[80px] text-gray-500">
                                    {dep.depositoNombre || "Sin nombre"}{" "}
                                    {dep.principal ? "★" : ""}
                                  </span>
                                  <span className="font-bold text-blue-700">
                                    {dep.cantidad}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Acción rápida — siempre visible en modoCompra */}
                    {(tieneStock || modoCompra) && (
                      <div className="mt-2 flex justify-end">
                        <button
                          className={`text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white ${
                            modoCompra ? "bg-indigo-500" : "bg-blue-500"
                          }`}
                        >
                          {modoCompra ? "Agregar a compra ✓" : "Agregar ✓"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer de resultados */}
          <div className="border-t bg-gray-50 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                ↑↓ para navegar • Enter para seleccionar • Esc para limpiar
              </span>
              <span>{encontrados.length} de 50 mostrados</span>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {mostrarProductos && estado === "vacio" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-6 text-center">
            <Search size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">
              No se encontraron productos
            </p>
            <p className="text-sm text-gray-500 mt-1">
              No hay resultados para "{ultimaBusqueda}"
            </p>
            <div className="mt-3 text-xs text-gray-400">
              Prueba con otras palabras o código de barras
            </div>
          </div>
        </div>
      )}

      {/* Estado error */}
      {mostrarProductos && estado === "error" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-red-200 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-4 text-center">
            <AlertCircle size={24} className="mx-auto text-red-500 mb-2" />
            <p className="font-medium text-red-700">Error en la búsqueda</p>
            <p className="text-sm text-red-600 mt-1">
              No se pudo completar la búsqueda
            </p>
            <button
              onClick={() => handleBusqueda(ultimaBusqueda)}
              className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
