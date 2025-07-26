import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EstudianteListComponent } from "./componentes/estudiante-list/estudiante-list.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'certificadosAdmisionFrontend';
}
