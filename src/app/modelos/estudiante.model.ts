export interface Estudiante {
  id: number;
  estudiante: string;
  codigo: string;
  email: string;
  programaTecnico: string;
  semestre: number;
  horario: string;
  fechaLiquidacion: Date;
  referencia: string;
  estadoLiquidacion: string;
  conceptoFacturacion: string;
  conceptoId: number;
  tipoDocumento: string;
}