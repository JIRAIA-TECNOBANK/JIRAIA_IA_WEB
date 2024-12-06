import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable()
export class AppSettings {

    get baseUrlApiADM(): string {
        return environment.apiADM.url;
    }

    get baseUrlApiCRM(): string {
        return environment.apiCRM.url;
    }

    get baseUrlApiFaturamento(): string {
        return environment.apiFaturamento.url;
    }

    get baseUrlApiRegulatorio(): string {
        return environment.apiRegulatorio.url;
    }

    get baseUrlApiPortal(): string {
        return environment.api_econtrato.url;
    }

    get baseUrlApieGarantiaBackOfficeTecnobank(): string {
        return environment.api_eGarantia.urlBackOffice;
    }

    get baseUrlApiHackaton(): string {
        return environment.api_hackaton.url;
    }
    
    get endpointHub(): string {
      return `${environment.hubs.url}${environment.hubs.backoffice}`;
  }
}