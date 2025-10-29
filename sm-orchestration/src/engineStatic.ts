import { MessageResponse } from "./avatarConversation";
import { BaseConversationEngine } from "./engine";



export const _log = (...msg: any) => {
    console.log('StaticEngine|', ...msg);
}

export class StaticEngine extends BaseConversationEngine {
    
    currentMessageIndex: number = 0;
    
    messages: string[] = [
        'static message 1',
        'static message 2'
    ];

    constructor() {
        super();
    }

    async getResponseAsync(): Promise<MessageResponse> {
        _log('getResponseAsync');

        if (this.currentMessageIndex >= this.messages.length) {
            this.currentMessageIndex = 0;
        }

        const response = this.messages[this.currentMessageIndex];

        const r: MessageResponse = {
            response: response
        };

        this.currentMessageIndex++;

        return r;
    }

}
