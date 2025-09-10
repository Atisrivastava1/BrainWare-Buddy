'use server';
/**
 * @fileOverview This flow determines if a user query should be routed to the human helpdesk.
 *
 * - shouldRouteToHelpdesk - A function that takes a user query and returns a boolean indicating whether it should be routed to the helpdesk.
 * - ShouldRouteToHelpdeskInput - The input type for the shouldRouteToHelpdesk function.
 * - ShouldRouteToHelpdeskOutput - The return type for the shouldRouteToHelpdesk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShouldRouteToHelpdeskInputSchema = z.object({
  query: z.string().describe('The user query.'),
  chatHistory: z.string().optional().describe('The history of the conversation.'),
  faqSnippet: z.string().optional().describe('Relevant FAQ snippet to the query.'),
});
export type ShouldRouteToHelpdeskInput = z.infer<typeof ShouldRouteToHelpdeskInputSchema>;

const ShouldRouteToHelpdeskOutputSchema = z.object({
  shouldRoute: z
    .boolean()
    .describe(
      'A boolean indicating whether the query should be routed to the human helpdesk.'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason why the query should be routed to the human helpdesk.'),
});
export type ShouldRouteToHelpdeskOutput = z.infer<typeof ShouldRouteToHelpdeskOutputSchema>;

export async function shouldRouteToHelpdesk(
  input: ShouldRouteToHelpdeskInput
): Promise<ShouldRouteToHelpdeskOutput> {
  let attempts = 0;
  while (attempts < 3) {
    try {
      return await shouldRouteToHelpdeskFlow(input);
    } catch (error: any) {
      if (error.message.includes('429') && attempts < 2) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      } else {
        // Re-throw other errors to be handled by the caller
        throw error;
      }
    }
  }
  // If all retries fail, throw an error to be caught by the caller.
  throw new Error('Failed to get response from AI after multiple retries.');
}

const prompt = ai.definePrompt({
  name: 'shouldRouteToHelpdeskPrompt',
  input: {schema: ShouldRouteToHelpdeskInputSchema},
  output: {schema: ShouldRouteToHelpdeskOutputSchema},
  prompt: `You are a chatbot triaging student questions at Brainware University.

You will determine whether a given student query requires routing to the human helpdesk.
Consider the complexity of the query, whether it can be answered using the available FAQ snippet, and the existing chat history.

Answer in the format:
'''json
{
  "shouldRoute": true|false,
  "reason": "A brief explanation of why the query should or should not be routed to the helpdesk."
}
'''

Here's the student's query:
{{query}}

Here's the chat history, if any:
{{chatHistory}}

Here's the relevant FAQ snippet, if any:
{{faqSnippet}}
`,
});

const shouldRouteToHelpdeskFlow = ai.defineFlow(
  {
    name: 'shouldRouteToHelpdeskFlow',
    inputSchema: ShouldRouteToHelpdeskInputSchema,
    outputSchema: ShouldRouteToHelpdeskOutputSchema,
    model: 'googleai/gemini-1.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
