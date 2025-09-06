
'use server';

import { generateAnswer, GenerateAnswerInput, GenerateAnswerOutput } from '@/ai/flows/generate-answer-from-context';

export async function askQuestion(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    const result = await generateAnswer(input);
    return result;
}
