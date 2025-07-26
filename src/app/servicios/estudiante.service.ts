import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EstudiantePageResponse } from '../modelos/estudiante-page-response.model';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private baseUrl = 'http://localhost:8080/api/estudiantes';

  constructor(private http: HttpClient) {}

  listarTodosPaginado(page: number, size: number): Observable<EstudiantePageResponse> {
    const url = `${this.baseUrl}/listar?page=${page}&size=${size}`;
    return this.http.get<EstudiantePageResponse>(url);
  }

  // Constancia estándar
  generarConstancia(estudianteId: number): Observable<Blob> {
    return this.http
      .post<{ id: number }>(`${this.baseUrl}/reporte/constancia-estudio/${estudianteId}`, {})
      .pipe(
        switchMap((res) =>
          this.http.get(`${this.baseUrl}/reporte/${res.id}`, {
            responseType: 'blob',
          })
        )
      );
  }

  // Constancia personalizada (usa cuerpo del texto)
  generarConstanciaPersonalizada(estudianteId: number, cuerpo: string): Observable<Blob> {
    const url = `${this.baseUrl}/reporte/constancia-estudio/personalizada?id=${estudianteId}`;
    return this.http.post(url, { cuerpo }, { responseType: 'blob' });
  }
}