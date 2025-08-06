import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Estudiante } from '../../modelos/estudiante.model';
import { EstudianteService } from '../../servicios/estudiante.service';
import { DialogEditarCuerpoNotasComponent } from './certificado-notas-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-certificado-notas',
  standalone: true,
  imports: [
    MatIconModule,       // ✅ necesario para <mat-icon>
    MatButtonModule,     // ✅ necesario para mat-icon-button
    MatTooltipModule     // ✅ si estás usando matTooltip
  ],
  template: `
    <button mat-icon-button
            matTooltip="Generar constancia de notas"
            (click)="abrirDialogo()">
      <mat-icon class="icon-blue">assignment</mat-icon>
    </button>
  `,
  styles: [`.icon-blue { color: #1976d2; }`]
})
export class CertificadoNotasComponent {
  @Input() estudiante!: Estudiante;

  constructor(
    private dialog: MatDialog,
    private estudianteService: EstudianteService
  ) {}

  abrirDialogo(): void {
    const cuerpo = this.generarTexto(this.estudiante);

    const ref = this.dialog.open(DialogEditarCuerpoNotasComponent, {
      width: '600px',
      data: { cuerpo }
    });

    ref.afterClosed().subscribe((textoEditado: string) => {
      if (textoEditado?.trim()) {
        this.generarYDescargarCertificado(textoEditado);
      }
    });
  }

  generarYDescargarCertificado(texto: string): void {
    const est = this.estudiante;

    if (est.nivel == null) {
      alert('El estudiante no tiene nivel definido. No se puede generar el certificado.');
      return;
    }

    this.estudianteService
      .generarConstanciaNotasPersonalizada(est.id, est.nivel, texto)
      .subscribe({
        next: (pdf: Blob) => {
          const url = window.URL.createObjectURL(pdf);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificado_notas_${est.codigo}_nivel${est.nivel}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: err => console.error('❌ Error al generar certificado:', err)
      });
  }

  generarTexto(est: Estudiante): string {
    return `Que: ${est.estudiante}, identificado(a) con ${est.tipoDocumento} ${est.codigo} de ${est.lugarExpedicionDocumento},
cursó y aprobó satisfactoriamente el semestre ${est.semestre} en el programa Técnico laboral en ${est.programaTecnico}, modalidad ${est.horario}.
Periodo B 2025.`;
  }
}