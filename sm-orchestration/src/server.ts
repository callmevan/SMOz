import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as WebSocket from 'ws';
import app from './app';
import config from './config';
import * as bodyParser from 'body-parser';


import { AVATAR_EVENT, BaseAvatar } from './avatar';
import { AvatarFactory } from './avatarFactory';

let httpServer = null;

// const useHttps = true;
const useHttps = !config.production;

// TODO: move this to persistant storage 
const sessionMap = {};

let connectedClients = new Set();

// TODO: move inactivity message to avatar.ts
//  minutes * seconds * milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 mins
const INACTIVITY_MESSAGE = "Are you still there? is there anything else you'd like me to help?";
let inactive_message_sent = false;

const _log = (...msg: any) => {
    console.log('server|', ...msg);
}
const _warn = (...msg: any) => {
    console.warn('server|', ...msg);
}

if (useHttps) {
    //Local host development, use HTTPS
    const privateKey = fs.readFileSync(process.env.SSL_KEY, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERT, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    httpServer = https.createServer(credentials, app);
}
else {
    //Create HTTP only equivalents in a deploy
    httpServer = http.createServer(app);
}

app.get('/healthz', (req, res) => {
    res.status(200).send({
        status: 'ok'
    });
});
app.get('/healthz/version', (req, res) => {
    res.status(200).send({
        version: config.version
    });
});

app.post('/event', bodyParser.json(), (req, res) => {
    _log('received event:', JSON.stringify(req.body));

    const { kind, body } = req.body;
    const smResponse = fnGetSpeechResponse(body.text, body.variables);
    connectedClients.forEach((client: WebSocket) => {
        client.readyState === WebSocket.OPEN ? client.send(JSON.stringify(smResponse)) : null;
    });

    return res.status(200).send({
        status: 'ok'
    });
});

const wsServer = new WebSocket.Server({ server: httpServer });

httpServer.listen(config.express.port, () => {
    _log('Express server (' + (useHttps ? 'HTTPS' : 'HTTP') + ') listening on port:' + config.express.port);
});


wsServer.on('connection', async (ws: WebSocket, req) => {
    _log('got a connection');

    let interactionIntervalId = null;
    let currentSessionId = null;

    let avatar: BaseAvatar;


    const sendWsMessage = (message, variables = {}) => {
        const r = fnGetSpeechResponse(message, variables);
        const s = JSON.stringify(r);
        _log('sending:', s);

        ws.send(s);
    }
    const resetInactive = () => {
        if (interactionIntervalId) {
            // _log('clearing timeout for inactive message')
            clearTimeout(interactionIntervalId);
        }
    }
    const setInactiveTimeout = () => {
        if (!inactive_message_sent) {
            // _log('setting timeout for inactive message')
            interactionIntervalId = setTimeout(() => {
                _log('interaction timeout, checking if user is still there..');
                sendWsMessage(INACTIVITY_MESSAGE);

                inactive_message_sent = true;
            }, INACTIVITY_TIMEOUT);
        }
    };

    const handleConnectedAsync = async (messageObject) => {
        _log('got a connected message', messageObject.body.session);
        currentSessionId = messageObject.body.session.sessionId;
        connectedClients.add(ws);

        const userInfo = messageObject.body.session.userInfo;
        if (userInfo) {
            const userInfoJSON = JSON.parse(userInfo);

            _log("initialising sesisonMap for userInfo ", userInfoJSON);
            sessionMap[userInfoJSON.sessionID] = {
                userID: userInfoJSON.userID,
                avatar: userInfoJSON.avatar
            };

            _log("sesisonMap initialised", sessionMap);
            if (avatar) {
                _log('avatar already initialised.. skipping');
            }
            else {
                _log(`initialising avatar.. currentSessionId: ${currentSessionId}, sessionMap: ${JSON.stringify(sessionMap)}`);

                const userName = sessionMap[currentSessionId]?.userID || "";
                _log('userName:', userName);

                const avatarName = sessionMap[currentSessionId]?.avatar;
                _log('avatarName:', avatarName);

                avatar = AvatarFactory.createAvatar(avatarName, userName)
                avatar.on(AVATAR_EVENT.MESSAGE_TO_USER, (message, variables) => {
                    _log('got a message to user:', message, variables);
                    sendWsMessage(message, variables);
                });

                await avatar.handleInitialMessageAsync();
            }
        }

    }

    const handleConversationRequestAsync = async (messageObject) => {
        _log('got a conversationRequest message');

        //textQuery = the transcribed text from the audio TTS or the typed user query
        //This should be passed through to your conversational platform to determine 
        // what to speak to the end user in response
        const userText = messageObject?.body?.input?.text?.toLowerCase();
        const isInitialRequest = messageObject?.body?.optionalArgs?.kind === "init"
        const { speakResults } = messageObject?.body?.optionalArgs?.speakResults || false

        if (isInitialRequest) {
            _log('initial request message', messageObject);
        }
        else if (!userText) {
            _warn('no text from user received');
            return true;
        }
        else {
            _log(`received message from user: ${userText}`);

            try {
                // await avatar.handleReplyMessageAsync(userText);
                // send to webhook api for modetrator
                const url = "http://oz-server:3002/generate";
                _log('sending to webhook:', url);
                const data = { query: userText };
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
            }
            catch (error) {
                _warn('error:', error);
                sendWsMessage("Sorry, Something is wrong in my side. Please try again later");
            }
        }

    }

    const handleSessionStateAsync = async (messageObject) => {
        const state = messageObject?.body?.session?.state;
        _log('got a session state message', state);

        switch (state) {
            case 'connected':
                await handleConnectedAsync(messageObject);
                break;

            case 'offered':
                _log('got an offered session state', messageObject.body.session.meta);
                break;

            default:
                _warn('got an unknown session state', state);
                break;
        }
    };

    const handlePersonaState = (messageObject) => {
        const persona = messageObject?.body?.persona;
        _log('got a persona state message', JSON.stringify(persona));

        if (!avatar) {
            // if avatar not ready, exit.. nothing to do here.
            return;
        };

        const allSpeechState = Object.values(persona).map((p: any) => {
            // _log('persona state:', p);
            return p.speechState;
        });
        // _log('allSpeechState:', allSpeechState);

        const speechStateUndefined = allSpeechState.some(s => typeof (s) === 'undefined');
        // _log('speechStateUndefined:', speechStateUndefined);

        if (!speechStateUndefined) {
            const allIdle = allSpeechState.every(s => s === 'idle');
            _log('setting avatar.isSpeechIdle', allIdle);
            avatar.isSpeechIdle = allIdle;
        }
    }

    const handleStateMessageAsync = async (messageObject) => {
        _log('got a state message');

        if (messageObject?.body?.session) {
            await handleSessionStateAsync(messageObject);
        }

        if (messageObject?.body?.persona) {
            handlePersonaState(messageObject);
        }
    }

    const checkMessageNameAsync = async (messageObject) => {
        switch (messageObject?.name) {
            case 'state':
                // _log('got a state message');
                await handleStateMessageAsync(messageObject);
                break;

            case 'conversationRequest':
                // _log('got a conversationRequest message');
                await handleConversationRequestAsync(messageObject);
                resetInactive();
                setInactiveTimeout();
                break;

            case 'conversationResult':
                // _log('got a conversationResult message');                    
                resetInactive();
                setInactiveTimeout();
                break;

            case 'activation':
                _log('got an activation message', messageObject?.body.context);
                break;

            case 'personaResponse':
                _log('got personaResponse message');
                break;

            case 'speechMarker':
                _log('got speechMarker message');
                break;

            case 'recognizeResults':
                _log('got recognizeResults message');
                break;

            default:
                _warn('got an unknown message name', messageObject?.name);
                break;
        }
    }

    const checkMessageKindAsync = async (messageObject) => {
        switch (messageObject?.kind) {
            case 'event':
                // _log('got an event message');
                await checkMessageNameAsync(messageObject);
                break;

            case 'scene':
                _log('got scene message');
                break;

            case 'response':
                _log('got response message');
                break;

            default:
                _warn('got an unknown message kind', messageObject?.kind, messageObject);
                break;
        }
    }


    ws.on('message', async (message: string) => {
        // _log('received:', message);

        try {
            const messageObject = JSON.parse(message);
            // _log('messageObject:', messageObject);

            await checkMessageKindAsync(messageObject);

        } catch (error) {
            _warn('error:', error);

            if (interactionIntervalId) {
                clearTimeout(interactionIntervalId);
                _log('interaction removed on error')
            }
        }
    });

    // TODO: check why closing session isn't triggered when "Exit session"
    ws.on('close', () => {
        _log('connection closed');
        if (interactionIntervalId) {
            clearTimeout(interactionIntervalId);
            _log('interaction removed')
        }
        connectedClients.delete(ws);
        delete sessionMap[currentSessionId];

        if (avatar) {
            avatar.destroy();
            avatar = null;
        }
    });

    ws.on('error', (err) => {
        _warn('connection error:', err);
    });

});

/**
 * 
 * @param speakThis 
 * @param variables example {
                "public-cat": {
                    "component": "image",
                    "data": {
                        "url": "https://placekitten.com/300/300",
                        "alt": "A cute kitten",
                    },
                }
            }
 * @returns 
 */
const fnGetSpeechResponse = (speakThis, variables = {}) => {
    return {
        "category": "scene",
        "kind": "request",
        "name": "conversationResponse",
        "transaction": null,
        "body": {
            "personaId": 1,
            "output": {
                "text": speakThis
            },
            "variables": variables
        }
    };
}

