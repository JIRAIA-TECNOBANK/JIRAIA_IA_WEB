// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiADM: {
    url: 'https://backoffice-admin-tst.tecnobank.com.br/api/'
  },
  apiCRM: {
    url: 'https://backoffice-crm-tst.tecnobank.com.br/api/'
  },
  apiFaturamento: {
    url: 'https://faturamento-api-tst.tecnobank.com.br/api/'
  },
  apiRegulatorio: {
    url: 'https://tst-regulatorio-api.tecnobank.com.br/api/'
  },
  api_econtrato: {
    url: 'https://tst-econtrato.tecnobank.com.br/api/'
  },
  api_eGarantia: {
    urlBackOffice: 'https://tst-egarantia-backoffice-api.tecnobank.com.br/api/'
  },
  api_hackaton: {
    url: 'https://localhost:5001/api/'
  },
  auth: {
    url: 'https://auth-hml.tecnobank.com.br/auth',
    realm: 'tst-tecnobank',
    clientId: 'backoffice-web'
  },
  hubs: {
    url: 'https://tst-notification.tecnobank.com.br/',
    backoffice: 'backofficehub'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
