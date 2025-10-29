import { Request, Response } from 'express';
import { createJWTToken } from './auth-helpers';
import { appConfig } from '../config/app-config';


const _log = (...msg: any) => {
  console.log('AuthController|', ...msg);
}

export class AuthController {

  public authorize(req: Request, res: Response) {
    _log('authorize', req.body);
    
    const { avatar } = req.body || "dina";
    res.status(200)
      .json({
        success: true,
        url: `wss://${appConfig.sessionServer}`,
        jwt: createJWTToken(appConfig.orchestrationServer, avatar)
      })
  }
  
}

export const authController = new AuthController();
