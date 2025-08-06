import { Component, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { EstudianteService } from '../../servicios/estudiante.service';
import { Estudiante } from '../../modelos/estudiante.model';

@Component({
  selector: 'app-constancia-estudio',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <button mat-icon-button
            matTooltip="Generar constancia de estudio"
            (click)="generarConstancia()">
      <mat-icon class="icon-blue">assignment</mat-icon>
    </button>
  `,
  styles: [`.icon-blue { color: #1976d2; }`]
})
export class ConstanciaEstudioComponent {
  @Input() estudiante!: Estudiante;

  constructor(
    private estudianteService: EstudianteService,
    private dialog: MatDialog
  ) {}

  generarConstancia(): void {
    const cuerpo = this.generarTexto(this.estudiante);
    const ref = this.dialog.open(DialogEditarCuerpoInternoComponent, {
      width: '600px',
      data: { cuerpo }
    });

    ref.afterClosed().subscribe((textoEditado: string) => {
      if (textoEditado) {
        this.estudianteService
          .generarConstanciaPersonalizada(this.estudiante.id, textoEditado)
          .subscribe((pdf: Blob) =>
            this.descargarArchivo(pdf, `constancia_estudio_${this.estudiante.codigo}.pdf`)
          );
      }
    });
  }

  private generarTexto(est: Estudiante): string {
    return `Que: ${est.estudiante.toUpperCase()}, identificado(a) con ${est.tipoDocumento.toUpperCase()} ${est.codigo.toUpperCase()}, se encuentra matriculado(a) en esta Fundación para el segundo semestre del programa Técnico laboral en ${est.programaTecnico}. Con Jornada ${est.horario.toLowerCase()}. Periodo B 2025.

Inicio de semestre: 01 de julio 2025               Finalización: 4 de diciembre 2025

Duración de programa: 2 años
Intensidad horaria del programa: 1.248 horas
Intensidad horaria semanal: 24 horas`;
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

@Component({
  selector: 'dialog-editar-cuerpo-interno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Editar cuerpo del certificado</h2>
    <mat-dialog-content>
      <mat-form-field class="w-full">
        <textarea matInput [(ngModel)]="data.cuerpo" rows="10"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-button color="primary" (click)="ref.close(data.cuerpo)">Aceptar</button>
    </mat-dialog-actions>
  `,
  styles: [`.w-full { width: 100%; }`]
})
export class DialogEditarCuerpoInternoComponent {
  constructor(
    public ref: MatDialogRef<DialogEditarCuerpoInternoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cuerpo: string }
  ) {}
}