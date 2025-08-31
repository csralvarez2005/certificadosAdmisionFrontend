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
  selector: 'app-certificado-buena-conducta',
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
            matTooltip="Generar certificado de buena conducta"
            (click)="generarCertificado()">
      <mat-icon class="icon-green">verified</mat-icon>
    </button>
  `,
  styles: [`.icon-green { color: #2e7d32; }`]
})
export class CertificadoBuenaConductaComponent {
  @Input() estudiante!: Estudiante;

  constructor(
    private estudianteService: EstudianteService,
    private dialog: MatDialog
  ) {}

  generarCertificado(): void {
    const cuerpo = this.generarTexto(this.estudiante);

    const ref = this.dialog.open(DialogEditarCuerpoConductaComponent, {
      width: '600px',
      data: { cuerpo }
    });

    ref.afterClosed().subscribe((textoEditado: string) => {
      if (textoEditado) {
        this.estudianteService
          .generarCertificadoBuenaConducta(this.estudiante.id, textoEditado)
          .subscribe((pdf: Blob) =>
            this.descargarArchivo(pdf, `certificado_buena_conducta_${this.estudiante.codigo}.pdf`)
          );
      }
    });
  }

  private generarTexto(est: Estudiante): string {
    return `Que: el estudiante ${est.estudiante.toUpperCase()}, identificado(a) con ${est.tipoDocumento.toLowerCase()} No. ${est.codigo}, durante su permanencia en esta institución, en el programa Técnico Laboral en ${est.programaTecnico}, se distinguió por mantener una conducta ejemplar y un comportamiento adecuado en el ámbito académico y disciplinario.

Su formación se desarrolló en la modalidad presencial diurna, comprendida desde el segundo periodo académico del año 2023 hasta el primer periodo académico del año 2025.

Este certificado se expide en ${est.lugarExpedicionDocumento}.

Fecha de emisión: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}.`;
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
  selector: 'dialog-editar-cuerpo-conducta',
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
        <textarea matInput [(ngModel)]="data.cuerpo" rows="12"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-button color="primary" (click)="ref.close(data.cuerpo)">Aceptar</button>
    </mat-dialog-actions>
  `,
  styles: [`.w-full { width: 100%; }`]
})
export class DialogEditarCuerpoConductaComponent {
  constructor(
    public ref: MatDialogRef<DialogEditarCuerpoConductaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cuerpo: string }
  ) {}
}