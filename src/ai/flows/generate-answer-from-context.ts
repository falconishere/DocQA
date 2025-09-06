'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating answers to questions based on a given context.
 *
 * - generateAnswerFromContext - A function that takes a question and context as input and returns an AI-generated answer.
 * - GenerateAnswerFromContextInput - The input type for the generateAnswerFromContext function.
 * - GenerateAnswerFromContextOutput - The return type for the generateAnswerFromContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswerFromContextInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  context: z.string().describe('The relevant context from the document.'),
});
export type GenerateAnswerFromContextInput = z.infer<typeof GenerateAnswerFromContextInputSchema>;

const GenerateAnswerFromContextOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type GenerateAnswerFromContextOutput = z.infer<typeof GenerateAnswerFromContextOutputSchema>;

export async function generateAnswerFromContext(input: GenerateAnswerFromContextInput): Promise<GenerateAnswerFromContextOutput> {
  return generateAnswerFromContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerFromContextPrompt',
  input: {schema: GenerateAnswerFromContextInputSchema},
  output: {schema: GenerateAnswerFromContextOutputSchema},
  prompt: `You are a helpful AI assistant that answers questions based on the given context.\n\nContext:\n{{context}}\n\nQuestion:\n{{question}}\n\nAnswer:`,
});

const generateAnswerFromContextFlow = ai.defineFlow(
  {
    name: 'generateAnswerFromContextFlow',
    inputSchema: GenerateAnswerFromContextInputSchema,
    outputSchema: GenerateAnswerFromContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
