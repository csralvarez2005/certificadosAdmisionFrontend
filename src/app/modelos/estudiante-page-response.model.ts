import { Estudiante } from './estudiante.model';

export interface EstudiantePageResponse {
  estudiantes: Estudiante[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
}