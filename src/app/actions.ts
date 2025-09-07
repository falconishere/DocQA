
'use server';

import { generateAnswer, GenerateAnswerInput, GenerateAnswerOutput } from '@/ai/flows/generate-answer-from-context';
import { extractTextFromUrl, ExtractTextFromUrlInput, ExtractTextFromUrlOutput } from '@/ai/flows/extract-text-from-url';

export async function askQuestion(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    const result = await generateAnswer(input);
    return result;
}

export async function fetchContentFromUrl(input: ExtractTextFromUrlInput): Promise<ExtractTextFromUrlOutput> {
    const result = await extractTextFromUrl(input);
    return result;
}
