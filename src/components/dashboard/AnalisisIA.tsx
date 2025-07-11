import { ArrowBigDown, Brain, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

const AnalisisIA = () => {
  const [analisis, setAnalisis] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDiv, setOpenDiv] = useState(false)
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalisis = async () => {
      try {
        const response = await fetch("/api/ia/analisis-ventas");
        if (!response.ok) {
          throw new Error("No se pudo obtener el análisis.");
        }
        const data = await response.json();
        setAnalisis(data.analisis);
        // console.log('analisis ->', data.analisis);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalisis();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <p className="text-gray-500">Analizando datos, por favor espera...</p>
      );
    }
    if (error) {
      return <p className="text-red-500">Error: {error}</p>;
    }
    // Usamos una etiqueta <pre> para respetar los saltos de línea y espacios del texto plano
    return <pre className="whitespace-pre-wrap font-sans">{analisis}</pre>;
  };

  const handleCancel = () => {
    setOpenDiv(!openDiv)
    const divBox = document.getElementById("analisisIA");
    if (divBox) {
      divBox.classList.toggle("h-[400px]");
      divBox.classList.toggle("overflow-y-auto");
    }
  };

 return(
    <div
      id="analisisIA"
      className={`${loading ? "animate-pulse bg-primary-400/30" : ""} relative bg-primary-bg-componentes h-[400px] overflow-y-auto w-full 100 text-primary-texto  border shadow-[0_0_10px_0.5px_rgb(95-165-250)] shadow-primary-100/50  border-primary-100 duration-300 p-6 rounded-xl `}
    >
      <button onClick={handleCancel} className="absolute top-2 right-2 cursor-pointer text-primary-texto  duration-200 hover:text-primary-100">
        {openDiv ? <ChevronDown className="w-6 h-6 mr-2 stroke-primary-100 stroke-2" /> : <ChevronUp className="w-6 h-6 mr-2 stroke-primary-100 stroke-2" />}
      </button>
      <h3 className="text-xl font-bold mb-4 flex items-center ">
        <Brain className="w-6 h-6 mr-2 stroke-primary-100 stroke-2" />
        <span className="text-primary-100">Asesor de Negocios IA</span>
      </h3>
      <div className="">{renderContent()}</div>
    </div>
  );
};

export default AnalisisIA;
