import { atom, map } from 'nanostores';

export interface EstadoCaja {
  estado: 'abierta' | 'cerrada' | 'loading'; // Agregamos 'loading' para manejo visual inicial
  sesion?: {
    id: string;
    montoInicial: number;
    totalIngresos: number;
    totalEgresos: number;
    saldoActual: number;
    fechaApertura: string;
    caja?: {
      id: string;
      nombre: string;
    }
  };
}

export const cajaStore = map<EstadoCaja>({ estado: 'loading' });

export const actions = {
  fetchEstadoCaja: async () => {
    try {
      const res = await fetch('/api/caja/estado');
      if (res.ok) {
        const data = await res.json();
        cajaStore.set(data);
      } else {
        // Si falla auth o server, asumimos cerrada o mantenemos estado anterior pero sin loading
        const current = cajaStore.get();
        if (current.estado === 'loading') {
            cajaStore.setKey('estado', 'cerrada');
        }
      }
    } catch (error) {
      console.error('Error fetching caja:', error);
      cajaStore.setKey('estado', 'cerrada');
    }
  },

  abrirCaja: async (montoInicial: number) => {
    try {
      const res = await fetch('/api/caja/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoInicial }),
      });
      const data = await res.json();
      if (res.ok) {
        actions.fetchEstadoCaja();
        return { success: true, msg: 'Caja abierta' };
      } else {
        return { success: false, msg: data.msg || 'Error al abrir caja' };
      }
    } catch (error) {
      return { success: false, msg: 'Error de conexión' };
    }
  },

  cerrarCaja: async (montoFinalReal: number) => {
    try {
      const res = await fetch('/api/caja/cerrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoFinalReal }),
      });
      const data = await res.json();
      if (res.ok) {
        actions.fetchEstadoCaja();
        return { success: true, msg: 'Caja cerrada', resumen: data.resumen };
      } else {
        return { success: false, msg: data.msg || 'Error al cerrar caja' };
      }
    } catch (error) {
      return { success: false, msg: 'Error de conexión' };
    }
  },

  registrarMovimiento: async (tipo: 'ingreso' | 'egreso', monto: number, descripcion: string) => {
    try {
      const res = await fetch('/api/caja/movimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, monto, descripcion }),
      });
      const data = await res.json();
      if (res.ok) {
        actions.fetchEstadoCaja();
        return { success: true, msg: 'Movimiento registrado' };
      } else {
        return { success: false, msg: data.msg || 'Error al registrar movimiento' };
      }
    } catch (error) {
      return { success: false, msg: 'Error de conexión' };
    }
  }
};
