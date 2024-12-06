import { APP_INITIALIZER, NgModule } from "@angular/core";
import { KeycloakService } from "keycloak-angular";
import { AppSettings } from "../configs/app-settings.config";
import { initializeSignalr } from "../configs/initialize/signalr-init.factory";
import { AuthService } from "./auth/auth.service";
import { SignalrService } from "./hub/signalr.service";

@NgModule({
    imports: [],
    providers: [
        AppSettings,
        SignalrService,
        {
            provide: AuthService,
            deps: [KeycloakService]
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeSignalr,
            multi: true,
            deps: [SignalrService]
        }
    ]
})
export class CoreModule { }