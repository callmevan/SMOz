import 'dotenv/config'
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2"; // ES Modules import
import { v4 as uuidv4 } from 'uuid';
import { ACTION_PLAN_INTENTS, handleActionPlan } from './coaching/actionplan';
import { BaseConversationEngine } from './engine';

import {SensorHandler} from './sensor/sensorHandler';
import { MessageResponse } from './avatarConversation';
import { EmotionRecognitionHandler } from './emotionRecognition/emotionRecognitionHandler';

const _log = (...msg: any[]) => {
    console.log('|LexEngine|', ...msg);
}

export class LexEngine extends BaseConversationEngine {
    client: LexRuntimeV2Client;
    session: string = uuidv4();

    private fallbackFuncAsync? : (originalMessage: string, intentResult: {}) => Promise<MessageResponse>;

    constructor() {
        super();
        
        const config = {
            // profile: process.env.AWS_PROFILE || 'default',
            region: process.env.AWS_REGION || 'ap-southeast-2', //TODO: move region to config
        };
        this.client = new LexRuntimeV2Client(config);
    }

    setFallbackFunc(fallbackFuncAsync: (originalMessage: string, intentResult: {}) => Promise<MessageResponse>){
        this.fallbackFuncAsync = fallbackFuncAsync;
    } 

    async sendInitialAsync() {
        throw new Error('Method not implemented.');
    }

    async getResponseAsync(messages: any[]): Promise<MessageResponse> {
        _log('getResponseAsync', messages);

        const message = messages[messages.length - 1].content;
                
        const input = { 
            botId: process.env.BOT_ID, 
            botAliasId: process.env.BOT_ALIAS_ID,
            localeId: process.env.LOCALE_ID, 
            sessionId: this.session, 
            text: message, 
        };

        _log('input', JSON.stringify(input, null, 2));

        const command = new RecognizeTextCommand(input);

        const response = await this.client.send(command);
        _log('response', JSON.stringify(response, null, 2));
        const botMessages = response.messages;
        
        if (Object.values(ACTION_PLAN_INTENTS).includes(response.sessionState?.intent?.name)) {
            _log('action plan intent');
            const actionPlanResponse = await handleActionPlan(response, botMessages);
            return actionPlanResponse;
        }

        if (response.sessionState?.intent?.name === 'FallbackIntent') {
            _log('fallback intent');

            if (!this.fallbackFuncAsync) {
                return {response:"Sorry I don't have a way to handle fallback. Something wrong in my side. Please try again"};
            }
            
            return await this.fallbackFuncAsync(message, response);
        }

        if (!response.messages || response.messages.length === 0) {

            return {response:"Sorry I didn't get any answers. Something wrong in my side. Please try again"};
        }

        if (response.sessionState?.intent?.name === 'SensorData' 
        && (response.sessionState?.intent?.state === 'Fulfilled' || response.sessionState?.intent?.state === 'ReadyForFulfillment')) {
            const handler = new SensorHandler();
            const handlerResponse = await handler.handle(response.sessionState?.intent);
            return handlerResponse;
        }
        else if (response.sessionState?.intent?.name === 'EmotionalStateIntent') {
            const hanlder = new EmotionRecognitionHandler();
            const handlerResponse = await hanlder.handleAsync(response);
            return handlerResponse;
        }

        const responses = response.messages.map(message => message.content);
        _log('responses', responses);

        const r:MessageResponse = {
            response: responses.join(' ')
        }

        return r;
    }
}
