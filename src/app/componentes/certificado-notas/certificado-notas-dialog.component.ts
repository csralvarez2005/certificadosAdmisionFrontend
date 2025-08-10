import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'dialog-editar-cuerpo-notas',
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
      <!-- Cuerpo del certificado -->
      <mat-form-field class="w-full">
        <textarea 
          matInput 
          [(ngModel)]="data.cuerpo" 
          rows="6"
          placeholder="Texto del cuerpo del certificado">
        </textarea>
      </mat-form-field>

      <!-- Información del programa -->
      <mat-form-field class="w-full" style="margin-top: 10px;">
        <textarea 
          matInput 
          [(ngModel)]="data.infoPrograma" 
          rows="4"
          placeholder="Información del programa">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-button color="primary" (click)="guardar()">Aceptar</button>
    </mat-dialog-actions>
  `,
  styles: [`.w-full { width: 100%; }`]
})
export class DialogEditarCuerpoNotasComponent {
  constructor(
    public ref: MatDialogRef<DialogEditarCuerpoNotasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cuerpo: string; infoPrograma: string }
  ) {}

  guardar(): void {
    // Cerramos el modal devolviendo ambos valores
    this.ref.close({
      cuerpo: this.data.cuerpo,
      infoPrograma: this.data.infoPrograma
    });
  }
}