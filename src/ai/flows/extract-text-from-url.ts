

'use server';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // only for local dev

/**
 * @fileOverview A flow for extracting the main text content from a given URL.
 *
 * - extractTextFromUrl - A function that fetches a URL and extracts its text content.
 * - ExtractTextFromUrlInput - The input type for the extractTextFromUrl function.
 * - ExtractTextFromUrlOutput - The return type for the extractTextFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to fetch and extract text from.'),
});
export type ExtractTextFromUrlInput = z.infer<typeof ExtractTextFromUrlInputSchema>;

const ExtractTextFromUrlOutputSchema = z.object({
    content: z.string().describe('The extracted text content from the URL.'),
    title: z.string().describe('The title of the webpage.'),
});
export type ExtractTextFromUrlOutput = z.infer<typeof ExtractTextFromUrlOutputSchema>;

export async function extractTextFromUrl(input: ExtractTextFromUrlInput): Promise<ExtractTextFromUrlOutput> {
  return extractTextFromUrlFlow(input);
}

const extractTextPrompt = ai.definePrompt({
    name: 'extractTextPrompt',
    input: { schema: z.object({ htmlContent: z.string() }) },
    output: { schema: ExtractTextFromUrlOutputSchema },
    prompt: `You are an expert at parsing HTML and extracting the main article content from a webpage.
You will be given the raw HTML of a webpage.
Extract the main article text from it, removing all HTML tags, navigation bars, sidebars, headers, and footers.
Also extract the title of the page from the <title> tag.
Return only the clean text content and the title.

HTML Content:
{{{htmlContent}}}
`,
});


const extractTextFromUrlFlow = ai.defineFlow(
  {
    name: 'extractTextFromUrlFlow',
    inputSchema: ExtractTextFromUrlInputSchema,
    outputSchema: ExtractTextFromUrlOutputSchema,
  },
  async (input) => {
    try {
        const response = await fetch(input.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const htmlContent = await response.text();
        const { output } = await extractTextPrompt({ htmlContent });
        if (!output) {
            throw new Error('AI failed to extract text from HTML.');
        }
        return output;
    } catch (error) {
        console.error('Error in extractTextFromUrlFlow:', error);
        // In case of error, return empty content and a generic title
        return { content: 'Could not fetch or process the URL.', title: 'Error' };
    }
  }
);
