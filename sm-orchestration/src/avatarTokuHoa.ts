import { MessageResponse, TokuHoaAvatarConversation } from './avatarConversation';
import { BaseAvatar } from './avatar';

export const _log = (...msg: any) => {
    console.log('TokuHoaAvatar|', ...msg);
}

export class TokuHoaAvatar extends BaseAvatar {
    constructor(userName: string) {

        const conv = new TokuHoaAvatarConversation();
        conv.userName = userName;

        super(conv);

        this.initCombinedEngine();
    }
    async getInitialMessageAsync(): Promise<string[]> {
        _log('sendInitialAsync');

        // this.conversation.messagesHistory.push({
        //     role: "assistant",
        //     content: this.conversation.firstMessage.join(' ') 
        // });
       
        return this.conversation.firstMessage;
    }
    async getReplyMessageToUserTextAsync(message: string): Promise<MessageResponse> {
        _log('sendMessageAsync', message);

        this.conversation.messagesHistory.push({ role: "user", content: message });


        const response = await this.engine.getResponseAsync(this.conversation.messagesHistory);

        this.conversation.messagesHistory.push({ role: "assistant", content: response.response });

        return response;
    }
}
