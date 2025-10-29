export interface AppConfig {

  // true if the app is running in prod mode
  production: boolean;

  // a url like [project-name].soulmachines.cloud
  sessionServer: string;
  TH_sessionServer: string;

  // the public url of this server
  orchestrationServer: string,

  // a url like [project-name-ui].soulmachines.cloud
  uiServer: string,

  // certain features such as control via browser are only supported on dev servers
  productionPersona: boolean,

  // send all messages to orchestration server via the ui.
  // not allowed on production persona servers.
  // recommended for local development only.
  controlViaBrowser: boolean,

  // these can be generated on the session server
  jwt: {
      keyName: string,
      key: string,
      expires: string,
  },
  THjwt: {
        keyName: string,
        key: string,
        expires: string,
    },

  // load the ssl key and cert from local files
  ssl: {
      key: string,
      cert: string,
  },

  // where to run the express process
  express: {
      port: string | number,
      ip: string,
  },

  // which origin to allow CORS requests from
  origin: string,

   // the version of the app (set by the build process 
  //  format is 0.0.0-dev# - semver compliant with a  substr githash appended)
  version: string,

}
