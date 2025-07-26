import { Routes } from '@angular/router';
import { EstudianteListComponent } from './componentes/estudiante-list/estudiante-list.component';

export const routes: Routes = [
  {
    path: 'estudiantes',
    component: EstudianteListComponent
  },
  {
    path: '',
    redirectTo: 'estudiantes',
    pathMatch: 'full'
  }
];
