// Add bellow trusted domains, access tokens will automatically injected to be send to
// trusted domain can also be a path like https://www.myapi.com/users,
// then all subroute like https://www.myapi.com/useers/1 will be authorized to send access_token to.

// Domains used by OIDC server must be also declared here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const trustedDomains = {
    default: ['https://login.students-epitech.ovh'],
    config_classNameic: ['https://login.students-epitech.ovh'],
    config_without_silent_login: ['https://login.students-epitech.ovh'],
    config_without_refresh_token: ['https://login.students-epitech.ovh'],
    config_without_refresh_token_silent_login: ['https://login.students-epitech.ovh'],
    config_google: ['https://oauth2.googleapis.com', 'https://openidconnect.googleapis.com'],
    config_with_hash: ['https://login.students-epitech.ovh'],
};

// Service worker will continue to give access token to the JavaScript client
// Ideal to hide refresh token from client JavaScript, but to retrieve access_token for some
// scenarios which require it. For example, to send it via websocket connection.
trustedDomains.config_show_access_token = { domains: ['https://login.students-epitech.ovh'], showAccessToken: true };

// This example defines domains used by OIDC server separately from domains to which access tokens will be injected.
trustedDomains.config_separate_oidc_access_token_domains = {
    oidcDomains: ['https://login.students-epitech.ovh'],
    accessTokenDomains: ['https://myapi'],
};
