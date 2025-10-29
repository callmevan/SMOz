import { MessageResponse } from '../avatarConversation';
import { EmotionalState } from './emotional_state';

const _log = (...message) => {
    console.log('|EmotionRecognitionHandler|', ...message);
}

export class EmotionRecognitionHandler {

    async handleAsync(response): Promise<MessageResponse> {
        _log('EmotionalState intent');
        _log(response.sessionState?.intent?.slots?.mental_health?.value);

        if (response.sessionState?.intent?.slots?.mental_health?.value?.originalValue === "yes") {

            const emotionalState = new EmotionalState();
            const answer = await emotionalState.sendEStressTipsMessageAsync();
            // TODO some tips should be added
            _log('EmotionalStateIntent mental health tips', answer);

            const r: MessageResponse = {
                response: answer,
                variables: {}
            };
            return r;
        }
        else if (response.sessionState?.intent?.slots?.mental_health?.value?.originalValue === "no") {
            _log('EmotionalStateIntent mental health No');

            const r: MessageResponse = {
                response: "No problem, I'm always here to listen to you",
                variables: {}
            };
            return r;
        }


        const emotionalState = new EmotionalState();
        const answer = await emotionalState.sendEmotionalStateMessageAsync();
        _log('EmotionalStateIntent initial request', answer);


        const r: MessageResponse = {
            response: answer,
            variables: {}
        };

        return r;
    }
}