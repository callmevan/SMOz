const _log = (...msg: any[]) => {
    console.log('|EmotionalState|', ...msg);
}

export type Prediction = {
    anxiety?: number
    stress?: number
    arousal?: number
    valence?: number
}


export class EmotionalState {

    async sendEmotionalStateMessageAsync() {
        _log('sending emotional state');

        _log('url', process.env.EMOTION_RECOGNITION_URL);

        try {
            const response = await fetch(process.env.EMOTION_RECOGNITION_URL, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
            });
            console.log("response is ", response)
            if (!response.ok) {
              throw new Error(`Error! status: ${response.status}`);
            }
        
            // 👇️ const result: GetUsersResponse
            const predictionResult = (await response.json()) as Prediction;
        
            console.log('result is: ', JSON.stringify(predictionResult, null, 4));
            
            let answer = "" as string;
            let result = predictionResult.anxiety;
            
            if (result == 0){
                answer = "Your heart rate is very normal and it seems that you are very relaxed. Anyway, I'm always here to listen to you"

            }
            else{ if (result == 1){
                answer = "It seems that you are experiencing a little bit of stress. Would you like to hear about some tips for managing stress and anxiety?"
                
                }else{
                    answer = "It seems that you had a stressful day."
                }
            }
            return answer
        }
        catch(error){
            console.log("Error in fetching prediction result", error)
        }
    }

    async sendEStressTipsMessageAsync() {
        _log('sending stress tips');
        return "here are some stress managements tips ...."
    }
}
