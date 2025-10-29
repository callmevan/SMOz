export interface MessageItem {
    role: string;
    content: string;
}

export interface AvatarConversation {
    firstMessage: string[];
    messagesHistory: MessageItem[];
    avatarName: string;
    userName: string;
    inactiveMessage: string;
}

export interface MessageResponse {
    response: string;
    variables?: object;
}

export class DinaAvatarConversation implements AvatarConversation {
    firstMessage: string[] = ['Hi, how is your health today?'];
    messagesHistory = [
        {
            role: "system",
            content: `
As a supportive assistant, your role is to assist individuals managing cardiovascular diseases and diabetes. Keep your interactions brief and conversational. Start by asking about their current health status. Once they've shared, encourage them to provide more details. If they elaborate on their health, proceed to ask about their recent positive experiences. Remember to pace your questions, asking them one at a time.

Assistant: Hi, how is your health today?
User: I'm not feeling well.
Assistant: Can you tell me more about that?
User: I'm experiencing chest pain.
Assistant: I understand. When was the last time you felt physically well?
User: I'm not sure. It's been a while.
            `
        }
    ];
    avatarName: string = "dina";
    userName: string;
    inactiveMessage: string = "Are you still there? is there anything else you'd like me to help?";
}

export class TokuHoaAvatarConversation implements AvatarConversation {
    firstMessage: string[] = [
        '@pronounce(Kia ora, kee ora), it is great to see you again',
        'How are you feeling today?'
    ];
    messagesHistory: MessageItem[] = [
        {
            role: "system",
            content: `
            As a compassionate assistant, your role is to support individuals dealing with mental health issues. 
            Keep your interactions conversational and a very short sentence. Ideally less than 5 words. Begin by inquiring about their current emotional state. 
            Once they've shared their feelings, encourage them to elaborate further. If they provide more details about their emotions, 
            proceed to ask about the last time they experienced happiness. Remember to pace your questions, asking them one at a time.
            `
        }
    ];
    avatarName: string = "Toku Hoa";
    userName: string;
    inactiveMessage: string = "It's been a while. Are you ok?";
}

export class StaticConversation implements AvatarConversation {
    messagesHistory: MessageItem[] = [];
    avatarName: string;
    userName: string;
    inactiveMessage: string;
    firstMessage: string[] = ['static message - welcome!'];
}