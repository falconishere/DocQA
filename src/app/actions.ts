
'use server';

import { generateAnswerFromContext } from '@/ai/flows/generate-answer-from-context';
import { documentContext } from '@/lib/document-context';

export async function getAnswer(
  question: string
): Promise<{ answer?: string; error?: string }> {
  if (!question || question.trim().length === 0) {
    return { error: 'Question cannot be empty.' };
  }

  try {
    const result = await generateAnswerFromContext({
      question,
      context: documentContext,
    });
    if (!result.answer) {
      return { error: 'The AI could not generate an answer based on the provided document.' };
    }
    return { answer: result.answer };
  } catch (e) {
    console.error('Error generating answer:', e);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
