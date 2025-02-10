export type MovimientoStock = {
  id: string; // ID único del movimiento
  productoId: string; // ID del producto asociado al movimiento
  cantidad: number; // Cantidad involucrada en el movimiento
  tipo: "recarga" | "devolucion" | "vencimiento" | "movimiento"; // Tipo de movimiento
  fecha: string; // Fecha del movimiento (timestamp Unix)
  userId: string; // ID del usuario que realizó el movimiento
  proveedorId?: string; // ID del proveedor (si aplica)
  clienteId?: string; // ID del cliente (si aplica)
  motivo?: string; // Breve razón del movimiento (opcional)
  observacion?: string; // Descripción adicional del movimiento (opcional)
};


export type fichaPaciente = {
  id: string;
  pacienteId: string;
  userId: string;
  direccion?: string | null;
  celular?: string | null;
  estatura?: string | null;
  pais?: string | null;
  provincia?: string | null;
  ciudad?: string | null;
  obraSocial?: string | null;
  email?: string | null;
  srcPhoto?: string | null;
  grupoSanguineo?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};
export type DiagnosticosTypes = {
  id?: number;
  diagnostico: string;
  observacion: string;
  pacienteId?: string;
  userId?: string;
};

export type responseAPIType = {
  msg: string;
  code?: number;
  status?: string;
  body?: string;
  data?: pacienteType;
};

export type optionsSelectInputType = {
  id: number;
  value: string;
  name?: string;
};

export interface Antecedente {
  atecedente: string;
  fechaDiagnostico: string;
  estado: string;
  observacion?: string;
  descripcion?: string;
  tipo: 'personal' | 'familiar';
  condicion?: boolean;
}

export interface AntecedentesMedicosProps {
  antedecentes: Antecedente[];
}

export interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
  estado: 'activo' | 'completado' | 'suspendido';
}

export interface MedicationsProps {
  medications: Medication[];
}
export interface Documentos {
  nombre: string;
  tipo: 'laboratorios' | 'rayosx' | 'prescripcion' | 'electrocardiograma' | 'otros' | 'derivacion';
  fecha: string;
  tamaño: string;
  estado: 'pendiente' | 'revisar' | 'archivado';
  src: string;
}

export interface DocumentosAdjuntosProps {
  documentos: Documentos[];
}

export type signosVitalesTypes = {
  id: string;
  historiaClinica: string;
  pacienteId: string;
  userId: string;
  update_at?: string;
  created_at?: string;
  deleted_ar?: string;
  temperatura?: string;
  pulso?: string;
  respiracion?: string;
  tensionArterial?: string;
  saturacionOxigeno?: string;
  glucosa?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  dolor?: string;
};
