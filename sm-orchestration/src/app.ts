import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.config();
    }

    private config() {
        // support application/json
        this.app.use(bodyParser.json());
    }

}

export default new App().app;
