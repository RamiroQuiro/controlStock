import { useStore } from '@nanostores/react';
import { cajaStore, actions } from '../context/caja.store';
import { useEffect } from 'react';
import { showToast } from '../utils/toast/toastShow';

export const useCaja = () => {
  const caja = useStore(cajaStore);

  useEffect(() => {
    // Si está en loading inicial, intentamos cargar.
    // O si queremos polling, podríamos ponerlo aquí.
    if (caja.estado === 'loading') {
        actions.fetchEstadoCaja();
    }
  }, []);

  const refreshCaja = () => actions.fetchEstadoCaja();

  const abrirCaja = async (monto: number) => {
      const res = await actions.abrirCaja(monto);
      if (res.success) {
          showToast('success', res.msg);
          return true;
      }
      showToast('error', res.msg);
      return false;
  };

  const cerrarCaja = async (monto: number) => {
      const res = await actions.cerrarCaja(monto);
      if (res.success) {
          showToast('success', res.msg + (res.resumen ? ` Dif: ${res.resumen.diferencia}` : ''));
          return res.resumen;
      }
      showToast('error', res.msg);
      return null;
  };

  const registrarMovimiento = async (tipo: 'ingreso' | 'egreso', monto: number, desc: string) => {
      const res = await actions.registrarMovimiento(tipo, monto, desc);
      if (res.success) {
          showToast('success', res.msg);
          return true;
      }
      showToast('error', res.msg);
      return false;
  };

  return {
    caja,
    loading: caja.estado === 'loading',
    refreshCaja,
    abrirCaja,
    cerrarCaja,
    registrarMovimiento
  };
};
