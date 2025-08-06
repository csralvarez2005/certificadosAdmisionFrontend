import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';

// Angular Material imports
import { importProvidersFrom } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatTableModule,
      MatPaginatorModule,
      MatCardModule,
      MatButtonModule,
      MatIconModule,
      MatToolbarModule,
      FormsModule,
      HttpClientModule 
    )
  ]
};


