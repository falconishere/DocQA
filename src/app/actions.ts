
'use server';

import { generateAnswer, GenerateAnswerInput } from '@/ai/flows/generate-answer-from-context';

export async function askQuestion(input: GenerateAnswerInput) {
    const { answer } = await generateAnswer(input);
    return answer;
}
