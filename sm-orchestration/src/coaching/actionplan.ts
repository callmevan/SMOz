import {generateGenricResponse} from '../llm';

const ACTION_PLAN_INTENTS = {
    ADD: 'AddActionPlan',
    REVIEW: 'ReviewCurrentActionPlan',
    MODIFY: 'ChangeCurrentActionPlan',
    RECORD: 'RecordStatusActionPlan'
}

const getCurrentActionPlan = async () => {
    const actionPlans = [
        {
            "PlanType": "Exercise",
            "Duration": "30 minutes",
            "Frequency": "3 times a week",
            "TimeOfDay": "Morning",
            "Time": "7:00 AM",
            "Location": "Home",
            "WithWhom": "Alone"
        },
        {
            "PlanType": "Medication",
            "Dosage": "1 tablet",
            "Frequency": "2 times a day",

        },
    ]
    return actionPlans;
}

const handleActionPlan = async (response, botMessages) => {
    if (response.sessionState?.intent?.name === ACTION_PLAN_INTENTS.REVIEW && response.sessionState?.dialogAction?.slotToElicit === 'operation') {
        const actionPlans = await getCurrentActionPlan();
        const planTypes = actionPlans.map(plan => plan.PlanType).join(' and ')
        let actionPlanSummary;
        const systemPrompt = `You are a helpful assistant. 
                              Your task is to generate a summary of the given action plan from json data and tell it to user accordingly. 
                              Don't add the greetings like hi, hello, morning, etc. modify below response to make it more user friendly and describe the json data as sentence if any`;
        if (actionPlans.length === 0) {
            actionPlanSummary = `You don't have any action plan, Do you want to add one?`;
        }
        else if (actionPlans.length === 1) {
            actionPlanSummary = await generateGenricResponse(
                systemPrompt,
                `Your current action plan is ${planTypes} and It is ${JSON.stringify(actionPlans[0])}, Do you want to change it or add one?`
            );
            return actionPlanSummary;
        }
        else if (actionPlans.length > 1) {
            actionPlanSummary = await generateGenricResponse(
                systemPrompt,
                `Your current action plans are ${planTypes} and They are ${JSON.stringify(actionPlans)}, Do you want to change them or add one?`
            );
        }
        else {
            actionPlanSummary = botMessages
        }
        console.log('actionPlanSummary', actionPlanSummary);
        return {
            textToSpeak: actionPlanSummary,
            variables: {}
        };
    }
}

export {handleActionPlan, ACTION_PLAN_INTENTS}