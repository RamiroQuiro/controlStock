import { useEffect, useState } from "react";
import DivReact from "../../../../components/atomos/DivReact";

export default function StatsDashboard({
  textColor,
  icon: Icon,
  descripcion,
  h2,
  dataInfo,
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Si no hay datos, mantener en cero
    if (!dataInfo) {
      setCount(0);
      return;
    }

    // Duración de la animación en ms
    const duration = 750;
    // Número de pasos para la animación
    const steps = 20;
    // Intervalo entre cada incremento
    const stepTime = duration / steps;
    // Incremento por paso
    const increment = dataInfo / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= dataInfo) {
        setCount(dataInfo);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [dataInfo]);

  return (
    <DivReact styleDiv="w-full h-36 ">
      <h2 className="text-base text-gray-600">{h2}</h2>
      <div className="flex items-end gap-2 h-1/2 w-full">
        <div className={`text-xs flex gap-2 justify-center mt-2 items-center`}>
          <Icon className={`${textColor} w-8 h-8`} />
          <p className={`${textColor} text-2xl font-bold transition-all duration-200`}>
            {count}
          </p>
        </div>
        <span className="text-sm font-semibold text-gray-500 ml-1">
          {descripcion}
        </span>
      </div>
    </DivReact>
  );
}