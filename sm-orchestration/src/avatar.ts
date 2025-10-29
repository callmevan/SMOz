import { EventEmitter } from 'events';
import { Queue } from 'typescript-collections';

import { BaseConversationEngine } from './engine';
import { OpenAiConversationEngine } from './engineOpenAI';
import { AvatarConversation, MessageResponse } from './avatarConversation';
import { LexEngine } from './engineLex';
import { CombinedEngine } from './engineCombined';

export const _log = (...msg: any) => {
    console.log('avatar|', ...msg);
}

export const AVATAR_EVENT = {
    MESSAGE_TO_USER: 'avatar-event:message-to-user'
}

export abstract class BaseAvatar extends EventEmitter {

    private _isSpeechIdle: boolean = true;

    protected conversation: AvatarConversation;
    private _engine: BaseConversationEngine;

    abstract getInitialMessageAsync(): Promise<string[]>;
    abstract getReplyMessageToUserTextAsync(message: string): Promise<MessageResponse>;

    private _queue: Queue<MessageResponse> = new Queue<MessageResponse>();

    constructor(conversation: AvatarConversation) {
        super();
        this.conversation = conversation;
    }

    public get engine(): BaseConversationEngine {

        if (!this._engine) {
            throw new Error('Conversation engine not set');
        }

        return this._engine;
    }

    public set engine(value: BaseConversationEngine) {
        _log('set engine', value);
        this._engine = value;
    }

    public set isSpeechIdle(value: boolean) {
        _log('set isSpeechIdle', value);
        
        this._isSpeechIdle = value;

        if (this._isSpeechIdle) {
            this.dequeueMessage();
        }
    }

    initLexEngine() {
        _log('initLexEngine');
        this.engine = new LexEngine();
    }

    initOpenAiEngine() {
        _log('initOpenAiEngine');
        this.engine = new OpenAiConversationEngine();
    } 

    initCombinedEngine() {
        _log('initCombinedEngine');
        this.engine = new CombinedEngine();
    }

    getInactiveMessage(): string {
        return this.conversation.inactiveMessage;
    }

    emitMessageToUser(message: string, variables?: any) {
        _log('emitMessageToUser', message);
        this.emit(AVATAR_EVENT.MESSAGE_TO_USER, message, variables);
    }

    async handleInitialMessageAsync() {
        const initialMessageResponse = await this.getInitialMessageAsync();
        _log('initial message', ...initialMessageResponse);
        
        initialMessageResponse.forEach((message) => {
            const m: MessageResponse = {
                response: message
            }

            this._queue.enqueue(m);
        });
        
        this.dequeueMessage();
    }
    
    dequeueMessage() {
        if (this._queue.isEmpty()) {
            return;
        }

        const m = this._queue.dequeue();
        _log('dequeueMessage');

        this.emitMessageToUser(m.response, m.variables);
    }


    async handleReplyMessageAsync(message: string) {
        const m = await this.getReplyMessageToUserTextAsync(message);
        this.emitMessageToUser(m.response, m.variables);
    }

    destroy() {
        _log('destroy');
        this.removeAllListeners();
    }
}



