import { DinaAvatarConversation, MessageResponse, StaticConversation } from './avatarConversation';
import { BaseAvatar } from './avatar';
import { StaticEngine } from './engineStatic';

export const _log = (...msg: any) => {
    console.log('DinaAvatar|', ...msg);
}

export class DinaAvatar extends BaseAvatar {
    constructor(userName: string) {
        _log('DinaAvatar', userName);

        // const conv = new DinaAvatarConversation();
        const conv = new StaticConversation();
        conv.userName = userName;

        super(conv);

        // this.initLexEngine();
        this.engine = new StaticEngine();
    }
    
    async getInitialMessageAsync(): Promise<string[]> {
        _log('sendInitialAsync');

        // const initialMessage = `Hi ${this.conversation.userName}, How have you been feeling lately?`;
        // this.conversation.messagesHistory.push({ role: "assistant", content: initialMessage });
        const initialMessage = this.conversation.firstMessage;

        return initialMessage;
    }

    async getReplyMessageToUserTextAsync(message: string): Promise<MessageResponse> {
        _log('sendMessageAsync', message);

        const response = await this.engine.getResponseAsync(this.conversation.messagesHistory);
        return response;
    }
}
