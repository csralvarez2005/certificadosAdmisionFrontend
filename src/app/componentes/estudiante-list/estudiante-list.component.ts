import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstudianteService } from '../../servicios/estudiante.service';
import { Estudiante } from '../../modelos/estudiante.model';
import { EstudiantePageResponse } from '../../modelos/estudiante-page-response.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estudiante-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './estudiante-list.component.html',
  styleUrls: ['./estudiante-list.component.css'],
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
    'fechaLiquidacion',
    'estado',
    'accion',
  ];

  constructor(private estudianteService: EstudianteService, private dialog: MatDialog) {}

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
            fechaLiquidacion: this.parseFecha(est.fechaLiquidacion as unknown as string)
          }))
          .sort((a, b) =>
            a.fechaLiquidacion.getTime() - b.fechaLiquidacion.getTime()
          );

        this.totalItems = response.totalElementos;
        this.totalPaginas = response.totalPaginas;
      });
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.elementosPorPagina = event.pageSize;
    this.cargarEstudiantes();
  }

  accionEstudiante(est: Estudiante): void {
    switch (est.conceptoFacturacion) {
      case 'CONSTANCIA DE ESTUDIO':
        const cuerpoPorDefecto = this.generarTextoCuerpo(est);

        const dialogRef = this.dialog.open(ModalEditarCuerpoComponent, {
          width: '600px',
          data: { cuerpo: cuerpoPorDefecto }
        });

        dialogRef.afterClosed().subscribe((textoEditado: string) => {
          if (textoEditado) {
            this.estudianteService.generarConstanciaPersonalizada(est.id, textoEditado)
              .subscribe((pdf: Blob) => {
                this.descargarArchivo(pdf, `constancia_estudio_${est.codigo}.pdf`);
              });
          }
        });
        break;

      case 'CERTIFICADO DE NOTA':
        alert('Funcionalidad aún no implementada.');
        break;

      case 'CERTIFICADO BUENA CONDUCTA':
        alert('Funcionalidad aún no implementada.');
        break;
    }
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

  parseFecha(fecha: string): Date {
    const partes = fecha.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anio = parseInt(partes[2], 10);
    return new Date(anio, mes, dia);
  }

  generarTextoCuerpo(est: Estudiante): string {
    return `Que: ${est.estudiante.toUpperCase()}, identificado(a) con ${est.tipoDocumento.toUpperCase()} ${est.codigo.toUpperCase()}, se encuentra matriculado(a) en esta Fundación para el segundo semestre del programa Técnico laboral en ${est.programaTecnico}. Con Jornada ${est.horario.toLowerCase()}. Periodo B 2025.

Inicio de semestre: 01 de julio 2025               Finalización: 4 de diciembre 2025

Duración de programa: 2 años
Intensidad horaria del programa: 1.248 horas
Intensidad horaria semanal: 24 horas`;
  }
}

@Component({
  selector: 'modal-editar-cuerpo',
  template: `
    <h2 mat-dialog-title>Editar cuerpo del certificado</h2>
    <mat-dialog-content>
      <textarea [(ngModel)]="data.cuerpo" rows="10" cols="60" style="width:100%"></textarea>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Confirmar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule]
})
export class ModalEditarCuerpoComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalEditarCuerpoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cuerpo: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(this.data.cuerpo);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}