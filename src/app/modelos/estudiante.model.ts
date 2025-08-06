export interface Estudiante  {
  id: number;
  estudiante: string;
  codigo: string;
  email: string;
  programaTecnico: string;
  semestre: number;
  horario: string;
  fechaLiquidacion: Date ;
  referencia: string;
  estadoLiquidacion: string;
  conceptoFacturacion: string;
  conceptoId: number;
  tipoDocumento: string;
  nivel: number;
  asignatura: string;
  nota1?: number;
  nota2?: number;
  nota3?: number;
  notaDefinitiva?: number;
  lugarExpedicionDocumento: string;
}
