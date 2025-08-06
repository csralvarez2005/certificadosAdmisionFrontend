import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudianteService } from '../../servicios/estudiante.service';
import { Estudiante } from '../../modelos/estudiante.model';
import { EstudiantePageResponse } from '../../modelos/estudiante-page-response.model';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ConstanciaEstudioComponent } from '../constancia-estudio/constancia-estudio.component';
import { CertificadoNotasComponent } from '../certificado-notas/certificado-notas.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditarCuerpoNotasComponent } from '../../componentes/certificado-notas/certificado-notas-dialog.component';

@Component({
  selector: 'app-estudiante-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ConstanciaEstudioComponent,
    CertificadoNotasComponent
  ],
  templateUrl: './estudiante-list.component.html',
  styleUrls: ['./estudiante-list.component.css']
})
export class EstudianteListComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  paginaActual = 0;
  totalPaginas = 0;
  elementosPorPagina = 5;
  totalItems = 0;

  displayedColumns: string[] = [
    'nombre',
    'codigo',
    'programa',
    'concepto',
    'referencia',
    'fechaLiquidacion',
    'estado',
    'accion'
  ];

  constructor(
    private estudianteService: EstudianteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.estudianteService
      .listarTodosPaginado(this.paginaActual, this.elementosPorPagina)
      .subscribe((response: EstudiantePageResponse) => {
        this.estudiantes = response.estudiantes
          .map(est => ({
            ...est,
            fechaLiquidacion: new Date(est.fechaLiquidacion)
          }))
          .sort((a, b) => a.fechaLiquidacion.getTime() - b.fechaLiquidacion.getTime());

        this.totalItems = response.totalElementos;
        this.totalPaginas = response.totalPaginas;
      });
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.elementosPorPagina = event.pageSize;
    this.cargarEstudiantes();
  }

  descargarCertificado(certificado: { nivel: number; cuerpo: string }, est: Estudiante): void {
    this.estudianteService.generarConstanciaNotasPorCodigo(est.codigo, certificado.nivel)
      .subscribe((resp) => {
        const idGenerado = resp.id;
        this.estudianteService.descargarReportePdf(idGenerado)
          .subscribe((pdf: Blob) => {
            this.descargarArchivo(pdf, `certificado_notas_${est.codigo}_nivel${certificado.nivel}.pdf`);
          });
      });
  }

  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTooltip(concepto: string): string {
    switch (concepto) {
      case 'CONSTANCIA DE ESTUDIO':
        return 'Generar constancia de estudio';
      case 'CERTIFICADO DE NOTA':
        return 'Generar certificado de notas';
      case 'CERTIFICADO BUENA CONDUCTA':
        return 'Generar certificado de buena conducta';
      default:
        return 'Acción';
    }
  }

  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());
  }

  abrirCertificadoNotas(estudiante: Estudiante): void {
    const cuerpo = `Texto generado a partir del estudiante ${estudiante.estudiante}...`;

    const ref = this.dialog.open(DialogEditarCuerpoNotasComponent, {
      width: '600px',
      data: { cuerpo }
    });

    ref.afterClosed().subscribe((textoEditado: string) => {
      if (textoEditado?.trim()) {
        if (estudiante.nivel == null) {
          console.error('❌ Nivel inválido:', estudiante.nivel);
          alert('El estudiante no tiene nivel definido. No se puede generar el certificado.');
          return;
        }

        this.estudianteService
          .generarConstanciaNotasPersonalizada(estudiante.id, estudiante.nivel, textoEditado)
          .subscribe({
            next: (pdf: Blob) => {
              const blob = new Blob([pdf], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `certificado_notas_${estudiante.codigo}_nivel${estudiante.nivel}.pdf`;
              link.click();
              window.URL.revokeObjectURL(url);
            },
            error: (err) => {
              console.error('❌ Error al generar certificado:', err);
            }
          });
      }
    });
  }
}