export const environment = {
  production: true,
  apiADM: {
    url: '#{BackOffice.Admin.Url}#'
  },
  apiCRM: {
    url: '#{BackOffice.Crm.Url}#'
  },
  apiFaturamento: {
    url: '#{BackOffice.Faturamento.Url}#'
  },
  apiRegulatorio: {
    url: '#{Regulatorio.Url}#'
  },
  api_econtrato: {
    url: '#{Econtrato.Url}#'
  },
  auth: {
    url: '#{Keycloack.Url}#',
    realm: '#{Keycloak.Realm}#',
    clientId: '#{Keycloak.ClientId}#'
  },
  hubs: {
    url: 'https://#{NOTIFICATION_URL}#/',
    backoffice: 'backofficehub'
  }
};
