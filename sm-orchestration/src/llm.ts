import 'dotenv/config'
import { OpenAI } from 'openai';

const apiUrl = process.env.OPENAI_BASE_URL || "";
const apiKey =  process.env.OPENAI_API_KEY || "";
const model  = process.env.LLM || "";

const pplx = new OpenAI({
    baseURL: apiUrl,
    apiKey: apiKey,
});

const generateGenricResponse = async (systemPrompt, userPrompt) => {
    const completion = await pplx.chat.completions.create({
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.0,
    });
    const response = completion.choices[0]?.message.content.trim();
    return response;
};

const generateGenricResponsewithHistory = async (messages) => {
    const completion = await pplx.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.0,
    });
    const response = completion.choices[0]?.message.content.trim();
    return response;
};

export {generateGenricResponse, generateGenricResponsewithHistory};