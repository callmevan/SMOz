import * as express from 'express';
import * as bodyParser from 'body-parser';
import { authRoutes } from './auth/auth-routes';
import { validateAppConfig } from './config/validate-config';
import { appConfig } from './config/app-config';
import * as cors from 'cors';
class App {

  public app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(cors(
      {
        origin: appConfig.origin,
      }
    ))
    this.config();
  }

  private config() {
    // validate the env config
    validateAppConfig(appConfig);
    // remove x-powered-by header
    this.app.disable('x-powered-by');
    // support application/json
    this.app.use(bodyParser.json());
    // auth routing
    this.app.use('/auth', authRoutes);
    // health check
    this.app.get('/ping', (req, res) => {
      res.send('1');
    });
    this.app.get('/healthz', (req, res) => {
      res.status(200).send({
        status: 'ok'
      });
    });
    this.app.get('/healthz/version', (req, res) => {
      res.status(200).send({
        version: appConfig.version
      });
    });
  }

}

export default new App().app;
