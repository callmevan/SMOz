import * as jwt from 'jsonwebtoken';
import { appConfig } from '../config/app-config';

export const createJWTToken = (controlServer: string, avatar) => {

    console.log('createJWTToken', controlServer);
    
    if ( avatar === "dina" ) {
        const opts = {
            sessionServer: appConfig.sessionServer,
            publicKey: appConfig.jwt.keyName,
            privateKey: appConfig.jwt.key,
            expires: appConfig.jwt.expires
        }
        return createToken(controlServer,opts);
    }
    else {
        const opts = {
            sessionServer: appConfig.sessionServer,
            publicKey: appConfig.THjwt.keyName,
            privateKey: appConfig.THjwt.key,
            expires: appConfig.jwt.expires
        }
        return createToken(controlServer, opts);
    }
}

const createToken = (controlServer: string, opts ) => {
    const {
        sessionServer,
        publicKey,
        privateKey,
        expires
    } = opts;
    var smControl = controlServer ? `wss://${appConfig.orchestrationServer}` : '';
    var smControlViaBrowser = appConfig.controlViaBrowser === true;
    var smSessionServer = sessionServer;

    var payload: any = {
		'sm-control': smControl,
        'sm-control-via-browser': smControlViaBrowser,
        'sm-session-server': smSessionServer,
        'iss': publicKey
    };

    var options: jwt.SignOptions = {
        algorithm: 'HS256',
        expiresIn: expires,
    };

    let token = jwt.sign(payload, privateKey, options);

    return token;

};