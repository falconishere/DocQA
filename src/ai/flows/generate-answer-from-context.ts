
'use server';
/**
 * @fileOverview A flow for generating answers from a given context.
 *
 * - generateAnswer - A function that generates an answer based on a question and context.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The question to answer.'),
  context: z.string().describe('The context to use for answering the question.'),
  answerType: z.string().describe('The desired style of the answer (e.g., Brief, Classic, Educational).'),
  domain: z.string().describe('The domain of the question (e.g., General, Education).'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
    answer: z.string().describe('The generated answer.'),
    source: z.string().describe('The source from the document, like a page or paragraph number.'),
    confidence: z.number().describe('A confidence score between 0 and 1 on how sure the model is.'),
    highlight: z.object({
        text: z.string().describe('The specific text from the context that supports the answer. This should be the full sentence or paragraph.'),
        startIndex: z.number().describe('The starting character index of the supporting text in the context.'),
        endIndex: z.number().describe('The ending character index of the supporting text in the context.'),
    }).describe('The supporting text snippet from the context.')
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
Your response should be in a {{answerType}} style and tailored for the {{domain}} domain.

{{#if context}}
You are an expert at answering questions based on the provided context.
Answer the following question based on the provided context.
You must provide a source reference, a confidence score, and the highlighted supporting text from the document.

When retrieving supporting text for the 'highlight' field, you must follow this rule:
- First, find the most relevant snippet that answers the question.
- Then, expand this snippet to include the ENTIRE sentence or paragraph it belongs to.
- The 'text' field must contain this full sentence or paragraph.
- The 'startIndex' and 'endIndex' must correspond to the exact start and end of that full sentence or paragraph in the original context.
- Never return a highlight that is a fragment of a sentence.

Context:
{{{context}}}
{{else}}
You should be conversational and helpful.
If the user asks a question, and you don't have any context, you should tell them you need a document to be uploaded to answer questions about it.
If they are just having a general conversation, you should respond conversationally. In this case, you can make up a source, set confidence to 0, and have an empty highlight object with empty text and indices set to -1.
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
    // Ensure the output is not null and handle cases where highlight might be missing for general conversation.
    if (!output) {
      throw new Error('AI failed to generate an answer.');
    }
    if (!output.highlight) {
      // Provide a default highlight object for conversational responses without context.
      output.highlight = { text: '', startIndex: -1, endIndex: -1 };
    }
    return output;
  }
);
