import { generateGenricResponsewithHistory } from './llm';
import { BaseConversationEngine } from './engine';
import { MessageResponse } from './avatarConversation';

export const _log = (...msg: any) => {
    console.log('OpenAIEngine|', ...msg);
}

export class OpenAiConversationEngine extends BaseConversationEngine {
    async getResponseAsync(messages: any[]): Promise<MessageResponse> {
        _log('getResponseAsync', messages);

        const response = await generateGenricResponsewithHistory(messages);
        const r: MessageResponse = {
            response: response
        };

        return  r;
    }
}
