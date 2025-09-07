
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
    answer: z.string().describe("The generated answer, quoted or paraphrased from the document."),
    highlight: z.object({
        text: z.string().describe('The specific text from the context that supports the answer. This should be the full sentence or paragraph.'),
        startIndex: z.number().describe('The starting character index of the highlight text within the original context.'),
        endIndex: z.number().describe('The ending character index (exclusive) of the highlight text within the original context.'),
    }).describe('The supporting text snippet from the context, including its exact location.')
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {schema: GenerateAnswerInputSchema},
  output: {schema: GenerateAnswerOutputSchema},
  prompt: `You are a Question Answering assistant connected to a document viewer.
Your response should be in a {{answerType}} style and tailored for the {{domain}} domain.

When answering, you MUST return a JSON object with this exact structure, and nothing else:
{
  "answer": "CONCISE_ANSWER",
  "highlight": {
    "text": "FULL_SENTENCE_OR_PARAGRAPH_FROM_CONTEXT",
    "startIndex": START_CHARACTER_INDEX,
    "endIndex": END_CHARACTER_INDEX
  }
}

RULES:
- The "answer" must be a concise answer to the user's question, derived from the provided context.
- The "highlight.text" must be the full sentence or paragraph from the context that contains the answer.
- The "highlight.startIndex" and "highlight.endIndex" must point to the exact start and end character positions of the "highlight.text" within the original document context.
- The indices must be zero-based.
- Do not modify or reformat the context in any way before calculating the indices. Every character, including whitespace and newlines, counts.
- If no context is provided, you should respond conversationally. In this case, the highlight object's text should be empty and indices should be -1.
- Do not include explanations, markdown, or any extra text outside of the JSON.

{{#if context}}
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
    if (!output) {
      return {
        answer: 'I apologize, but I was unable to generate a response. Please try again.',
        highlight: { text: '', startIndex: -1, endIndex: -1 },
      };
    }
    // Ensure highlight object and its properties exist to prevent frontend errors.
    if (!output.highlight) {
      output.highlight = { text: '', startIndex: -1, endIndex: -1 };
    }
    if (output.highlight.startIndex === undefined || output.highlight.endIndex === undefined) {
      output.highlight.startIndex = -1;
      output.highlight.endIndex = -1;
    }
    return output;
  }
);
