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
export class DialogEditarCuerpoNotasComponent {
  constructor(
    public ref: MatDialogRef<DialogEditarCuerpoNotasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cuerpo: string }
  ) {}
}