import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X } from "lucide-react";

const BarcodeScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Configuración del scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
      },
      /* verbose= */ false
    );

    // Callback de éxito
    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`Código escaneado: ${decodedText}`, decodedResult);
      // Reproducir sonido de "beep" si es posible (opcional)
      // const audio = new Audio('/beep.mp3'); audio.play().catch(e => {});

      onScan(decodedText);

      // Limpiar y cerrar
      scanner
        .clear()
        .catch((err) => console.error("Error al limpiar scanner", err));
    };

    // Callback de error (se llama frecuentemente si no detecta nada, así que mejor ignorar o loguear poco)
    const onScanFailure = (errorMessage) => {
      // console.warn(`Error de escaneo: ${errorMessage}`);
    };

    // Renderizar
    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    // Cleanup al desmontar
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Error al limpiar scanner en desmontaje", error);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
          <h3 className="font-semibold text-gray-800">Escanear Código</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Área de Cámara */}
        <div className="p-4 bg-black">
          <div id="reader" className="w-full"></div>
          {error && (
            <div className="mt-2 text-red-500 text-center text-sm">{error}</div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
          Apunta la cámara al código de barras del producto.
          <br />
          Asegúrate de que haya buena iluminación.
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
