import { MessageResponse } from "./avatarConversation";

export const _log = (...msg: any) => {
    console.log('engine|', ...msg);
}

export abstract class BaseConversationEngine {
    abstract getResponseAsync(messages: any[]): Promise<MessageResponse>;
}

