import { KeycloakService } from "keycloak-angular";
import { environment } from "src/environments/environment";

export function initializeKeycloak(keycloak: KeycloakService) {
    return () =>
        keycloak.init({
            config: {
                url: environment.auth.url,
                realm: environment.auth.realm,
                clientId: environment.auth.clientId
            },
            initOptions: {
                onLoad: 'login-required'
            }
        })
}