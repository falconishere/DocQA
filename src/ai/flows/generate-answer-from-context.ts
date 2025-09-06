
'use server';
/**
 * @fileOverview A flow for generating answers from a given context.
 *
 * - generateAnswer - A function that generates an answer based on a question and context.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {documentContext} from '@/lib/document-context';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The question to answer.'),
  context: z.string().describe('The context to use for answering the question.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
    answer: z.string().describe('The generated answer.'),
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {schema: GenerateAnswerInputSchema},
  output: {schema: GenerateAnswerOutputSchema},
  prompt: `You are a friendly and helpful assistant for a document Q&A application.

{{#if context}}
You are an expert at answering questions based on the provided context.
Answer the following question based on the provided context.

Context:
{{{context}}}
{{else}}
You should be conversational and helpful.
If the user asks a question, and you don't have any context, you should tell them you need a document to be uploaded to answer questions about it.
If they are just having a general conversation, you should respond conversationally.
{{/if}}

Question:
{{{question}}}
`,
});

const generateAnswerFlow = ai.defineFlow(
  {
    name: 'generateAnswerFlow',
    inputSchema: GenerateAnswerInputSchema,
    outputSchema: GenerateAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
