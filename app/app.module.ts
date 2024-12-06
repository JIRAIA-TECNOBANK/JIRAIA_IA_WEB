import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule } from '@angular/material/divider';
import { CoreModule } from './core/core.module';
import { ModulesModule } from './modules/modules.module';
import { SharedModule } from './shared/shared.module';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { FlexLayoutModule } from '@angular/flex-layout';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { initializeKeycloak } from './configs/initialize/keycloak-init.factory';
import { AuthGuard } from './core/guards/auth.guard';
import { BreadcrumbService } from './shared/services/breadcrumb.service';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {
  showMaskTyped: false
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MatDividerModule,
    FlexLayoutModule,
    KeycloakAngularModule,
    CoreModule,
    ModulesModule,
    SharedModule,
    NgxMaskModule.forRoot(options),
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
  ],
  providers: [
    BreadcrumbService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500,
        disableTooltipInteractivity: true,
      }
    },
    AuthGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
