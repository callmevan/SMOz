import { MessageResponse } from './avatarConversation';
import { BaseConversationEngine } from './engine';
import { LexEngine } from './engineLex';
import { OpenAiConversationEngine } from './engineOpenAI';


export const _log = (...msg: any) => {
    console.log('CombinedEngine|', ...msg);
}

export class CombinedEngine extends BaseConversationEngine {

    openAiEngine: OpenAiConversationEngine;
    lexEngine: LexEngine;

    constructor() {
        super();

        this.openAiEngine = new OpenAiConversationEngine();
        this.lexEngine = new LexEngine();
    }
    async getResponseAsync(messages: any[]): Promise<MessageResponse> {
        _log('getResponseAsync', messages);

        this.lexEngine.setFallbackFunc(async (originalMessage: string, intentResult: {}) => {
            _log('falling back..');
            const response = await this.openAiEngine.getResponseAsync(messages);
            return response;
        });

        _log('calling lexEngine.getResponseAsync');
        const response = await this.lexEngine.getResponseAsync(messages);
        return response;
    }
}
