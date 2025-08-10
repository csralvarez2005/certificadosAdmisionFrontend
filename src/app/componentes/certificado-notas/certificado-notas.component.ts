import { Component, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { EstudianteService } from '../../servicios/estudiante.service';
import { Estudiante } from '../../modelos/estudiante.model';

@Component({
  selector: 'app-certificado-notas',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <button mat-icon-button
            matTooltip="Generar certificado de notas"
            (click)="abrirVistaPrevia()">
      <mat-icon class="icon-green">description</mat-icon>
    </button>
  `,
  styles: [`.icon-green { color: #2e7d32; }`]
})
export class CertificadoNotasComponent {
  @Input() estudiante!: Estudiante;

  constructor(
    private estudianteService: EstudianteService,
    private dialog: MatDialog
  ) {}

abrirVistaPrevia(): void {
  this.estudianteService.obtenerNotasPorCodigo(this.estudiante.codigo)
    .subscribe({
      next: (notas) => {
        if (!notas || notas.length === 0) {
          alert('Este estudiante no tiene notas registradas.');
          return;
        }

        const modulosUnicos = new Set<string>();
        notas = notas
          .filter(n => n.asignatura && n.notaDefinitiva != null)
          .filter(n => modulosUnicos.add(n.asignatura.trim().toUpperCase() + "|" + n.notaDefinitiva));

        const niveles = [...new Set(notas.map(n => n.nivel))].filter(n => n != null);

        if (niveles.length === 0) {
          alert('El estudiante no tiene niveles registrados en sus notas.');
          return;
        }

        const ref = this.dialog.open(DialogVistaPreviaCertificadoNotasComponent, {
          width: '800px',
          data: { estudiante: this.estudiante, notas, niveles }
        });

        // ✅ Ahora recibimos cuerpo + infoPrograma
        ref.afterClosed().subscribe((result: { nivel: number; cuerpo: string; infoPrograma: string }) => {
          if (result) {
            this.estudianteService
              .generarConstanciaNotasPersonalizada(
                this.estudiante.id,
                result.nivel,
                result.cuerpo,
                result.infoPrograma // ← nuevo parámetro
              )
              .subscribe((pdf: Blob) =>
                this.descargarArchivo(
                  pdf,
                  `certificado_notas_${this.estudiante.codigo}_nivel${result.nivel}.pdf`
                )
              );
          }
        });
      },
      error: (err) => {
        console.error('Error obteniendo notas:', err);
      }
    });
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
  selector: 'dialog-vista-previa-certificado-notas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Vista previa - Certificado de Notas</h2>
    <mat-dialog-content>
      <!-- Selector de nivel -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Seleccione el nivel</mat-label>
        <mat-select [(ngModel)]="nivelSeleccionado" (selectionChange)="filtrarNotasPorNivel()">
          <mat-option *ngFor="let n of data.niveles" [value]="n">Nivel {{n}}</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Texto editable -->
      <mat-form-field class="w-full">
        <textarea matInput [(ngModel)]="cuerpoTexto" rows="6"></textarea>
      </mat-form-field>

      <!-- Tabla de notas -->
      <table class="notas-table" *ngIf="notasFiltradas.length > 0">
        <thead>
          <tr>
            <th>PERIODO</th>
            <th>MÓDULOS</th>
            <th>NOTAS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let n of notasFiltradas; let i = index">
            <td *ngIf="i === 0" [attr.rowspan]="rowSpan">{{ 'PERIODO - ' + nivelSeleccionado }}</td>
            <td>{{ n.asignatura }}</td>
            <td>{{ n.notaDefinitiva?.toFixed(2) }}</td>
          </tr>
          <tr class="promedio">
            <td colspan="2">PROMEDIO</td>
            <td>{{ promedioNotas.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="notasFiltradas.length === 0" style="color: red;">No hay notas para este nivel.</p>

      <!-- Texto editable de infoPrograma -->
<mat-form-field class="w-full">
  <textarea 
    matInput 
    [(ngModel)]="infoPrograma" 
    rows="4"
    placeholder="Información del programa">
  </textarea>
</mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-button color="primary"
        (click)="ref.close({
          nivel: nivelSeleccionado,
          cuerpo: cuerpoTexto,
          infoPrograma: infoPrograma
        })">
  Generar
</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full { width: 100%; }
    .notas-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .notas-table th, .notas-table td { border: 1px solid #ccc; padding: 4px; text-align: left; }
    .notas-table th { background: #f5f5f5; }
    .promedio td { font-weight: bold; }
    .info-programa { margin-top: 10px; font-size: 13px; }
  `]
})
export class DialogVistaPreviaCertificadoNotasComponent {
  nivelSeleccionado!: number;
  cuerpoTexto!: string;
  notasFiltradas: any[] = [];
  promedioNotas: number = 0;
  rowSpan = 0;

  constructor(
    public ref: MatDialogRef<DialogVistaPreviaCertificadoNotasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estudiante: Estudiante; notas: any[]; niveles: number[] }
  ) {
    this.nivelSeleccionado = data.niveles[0];
    this.cuerpoTexto = this.generarTexto(data.estudiante, this.nivelSeleccionado);
    this.filtrarNotasPorNivel();
  }

  generarTexto(est: Estudiante, nivel: number): string {
    return `Que: ${est.estudiante.toUpperCase()}, identificado(a) con ${est.tipoDocumento.toUpperCase()} ${est.codigo.toUpperCase()}, cursó y aprobó satisfactoriamente el ciclo (semestre) ${nivel} en esta institución en el programa Técnico Laboral por Competencias en ${est.programaTecnico.toUpperCase()}, en la modalidad ${est.horario.toLowerCase()} jornada ${est.horario.toLowerCase()} periodo B 2025. Donde obtuvo las siguientes notas:`;
  }

  filtrarNotasPorNivel(): void {
    const modulosUnicos = new Set<string>();

    this.notasFiltradas = this.data.notas
      .filter(n => n.nivel === this.nivelSeleccionado)
      .filter(n => n.asignatura && n.notaDefinitiva != null)
      .filter(n => modulosUnicos.add(
        n.asignatura.trim().toUpperCase() + "|" + n.notaDefinitiva
      ));

    this.rowSpan = this.notasFiltradas.length;
    this.promedioNotas = this.notasFiltradas.length > 0
      ? parseFloat((this.notasFiltradas.reduce((acc, n) => acc + n.notaDefinitiva, 0) / this.notasFiltradas.length).toFixed(2))
      : 0;
  }
  infoPrograma: string = `Duración de programa: 2 años
Intensidad horaria del programa: 1.358 horas
Intensidad horaria semanal: 24 horas`;
}