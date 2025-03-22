import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { formateoMoneda } from "../../utils/formateoMoneda";

const ResumenVentas: React.FC = ({ userId }: { userId: string }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Estados para manejar los datos
  const [datosVentas, setDatosVentas] = useState({
    meses: [],
    datos: [],
    ventasTotales: 0,
    ticketPromedio: 0,
    totalTransacciones: 0,
    etiquetas: [],
    montosPorPeriodo: [],
    periodoActual: ""
  });
  const [filtroTiempo, setFiltroTiempo] = useState('añoActual');
  const [isLoading, setIsLoading] = useState(true);

  // Manejador del cambio de filtro
  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroTiempo(e.target.value);
  };

  // Efecto para cargar los datos
  useEffect(() => {
    const fetchDatosVentas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/sales/resumenVentas', {
          headers: {
            'x-user-id': userId,
            'filtro-selector': filtroTiempo
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }

        const data = await response.json();
        setDatosVentas({
          meses: data.meses,
          datos: data.montosPorMes,
          ventasTotales: data.ventasTotales,
          ticketPromedio: data.ticketPromedio,
          totalTransacciones: data.totalTransacciones,
          etiquetas: data.etiquetas,
          montosPorPeriodo: data.montosPorPeriodo,
          periodoActual: data.periodoActual
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatosVentas();
  }, [userId, filtroTiempo]);

  // Efecto para actualizar el gráfico
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current || isLoading) return;

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datosVentas.etiquetas.map(etiqueta => 
          datosVentas.periodoActual === "días" ? `Día ${etiqueta}` : etiqueta
        ),
        datasets: [{
          label: datosVentas.periodoActual === "días" ? 'Ventas Diarias' : 'Ventas Mensuales',
          data: datosVentas.montosPorPeriodo,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: datosVentas.periodoActual === "días" ? 15 : 35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Resumen de Ventas'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Ventas: ${formateoMoneda.format(context.raw)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formateoMoneda.format(value)
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [datosVentas, isLoading]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-lg font-semibold">Resumen de Ventas</h2>
        <select 
          value={filtroTiempo}
          onChange={handleFiltroChange}
          className="text-sm border rounded p-1"
        >
          <option value="añoActual">Este Año</option>
          <option value="ultimos6Meses">Últimos 6 Meses</option>
          <option value="mesActual">Este Mes</option>
        </select>
      </div>
      
      <div className="w-full h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <span>Cargando datos...</span>
          </div>
        ) : (
          <canvas ref={chartRef}></canvas>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 w-full">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Ventas Totales este Mes</p>
          <p className="text-xl font-bold text-green-600">
            {formateoMoneda.format(datosVentas.ventasTotales)}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Ticket Promedio este Mes</p>
          <p className="text-xl font-bold text-blue-600">
            {formateoMoneda.format(datosVentas.ticketPromedio)}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Transacciones este Mes</p>
          <p className="text-xl font-bold text-purple-600">
            {datosVentas.totalTransacciones}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumenVentas;