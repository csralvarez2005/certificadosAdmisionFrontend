import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EstudiantePageResponse } from '../modelos/estudiante-page-response.model';
import { Estudiante } from '../modelos/estudiante.model';
import { FilaNota } from '../modelos/fila-nota.model';

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

  generarConstancia(estudianteId: number): Observable<Blob> {
    return this.http
      .post<{ id: number }>(`${this.baseUrl}/reporte/constancia-estudio/${estudianteId}`, {})
      .pipe(
        switchMap((res: { id: number }) =>
          this.http.get(`${this.baseUrl}/reporte/${res.id}`, {
            responseType: 'blob',
          })
        )
      );
  }

  generarConstanciaPersonalizada(estudianteId: number, cuerpo: string): Observable<Blob> {
    const url = `${this.baseUrl}/reporte/constancia-estudio/personalizada?id=${estudianteId}`;
    return this.http.post(url, { cuerpo }, { responseType: 'blob' });
  }

  generarConstanciaNotasPorCodigo(codigo: string, nivel: number): Observable<{ id: number }> {
    const url = `${this.baseUrl}/reporte/constancia-notas/${codigo}?nivel=${nivel}`;
    return this.http.post<{ id: number }>(url, {});
  }

  descargarReportePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reporte/${id}`, {
      responseType: 'blob',
    });
  }

  generarConstanciaNotasYDescargar(codigo: string, nivel: number): Observable<Blob> {
    const urlGenerar = `${this.baseUrl}/reporte/constancia-notas/${codigo}?nivel=${nivel}`;

    return this.http.post<{ id: number }>(urlGenerar, {}).pipe(
      switchMap((res: { id: number }) =>
        this.http.get(`${this.baseUrl}/reporte/${res.id}`, {
          responseType: 'blob',
        })
      )
    );
  }

  generarConstanciaNotasPersonalizada(
    id: number,
    nivel: number,
    cuerpo: string,
    infoPrograma: string
  ): Observable<Blob> {
    console.log('📌 Enviando a backend:', { id, nivel, cuerpo, infoPrograma });

    const params = new HttpParams()
      .set('id', id.toString())
      .set('nivel', nivel.toString())
      .set('cuerpo', cuerpo || '')
      .set('infoPrograma', infoPrograma || '');

    return this.http.get(`${this.baseUrl}/constancia-notas`, {
      params,
      responseType: 'blob',
    });
  }

  generarTablaNotas(estudianteId: number, nivel: number): Observable<FilaNota[]> {
    return this.http.get<FilaNota[]>(`/api/notas/generarTablaNotasJson`, {
      params: {
        estudianteId: estudianteId.toString(),
        nivelDeseado: nivel.toString(),
      },
    });
  }

  obtenerNotasPorCodigo(codigo: string): Observable<Estudiante[]> {
    const url = `${this.baseUrl}/notas/${codigo}`;
    return this.http.get<Estudiante[]>(url);
  }

  obtenerTablaNotasPorCodigo(codigo: string, nivel: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notas/tabla/${codigo}?nivel=${nivel}`);
  }

  generarConstanciaNotas(id: number, nivel: number): Observable<Blob> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('nivel', nivel.toString());

    return this.http.get(`${this.baseUrl}/constancia-notas`, {
      params,
      responseType: 'blob',
    });
  }

  // ✅ Nuevo: Generar certificado de buena conducta y luego descargar el PDF
  generarCertificadoBuenaConducta(
    estudianteId: number,
    cuerpo?: string
  ): Observable<Blob> {
    return this.generarCertificadoBuenaConductaId(estudianteId, cuerpo).pipe(
      switchMap((res) =>
        this.http.get(`${this.baseUrl}/reporte/${res.id}`, {
          responseType: 'blob',
        })
      )
    );
  }

  // ✅ Nuevo: Generar certificado y obtener solo el id + mensaje
  generarCertificadoBuenaConductaId(
    estudianteId: number,
    cuerpo?: string
  ): Observable<{ id: number; mensaje: string }> {
    return this.http.post<{ id: number; mensaje: string }>(
      `${this.baseUrl}/reporte/certificado-buena-conducta/${estudianteId}`,
      cuerpo ? { cuerpo } : {}
    );
  }
}
