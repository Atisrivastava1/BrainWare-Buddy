'use server';

/**
 * @fileOverview A flow to tell riddles to the user.
 *
 * - tellRiddle - A function that handles the riddle process.
 * - TellRiddleInput - The input type for the tellRiddle function.
 * - TellRiddleOutput - The return type for the tellRiddle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TellRiddleInputSchema = z.object({
  chatHistory: z.string().describe('The history of the conversation.'),
});
export type TellRiddleInput = z.infer<typeof TellRiddleInputSchema>;

const TellRiddleOutputSchema = z.object({
  response: z.string().describe("The chatbot's response, which could be a riddle, a confirmation, or a final answer."),
  isDone: z.boolean().optional().describe('Whether the riddle session is complete.'),
});
export type TellRiddleOutput = z.infer<typeof TellRiddleOutputSchema>;

export async function tellRiddle(input: TellRiddleInput): Promise<TellRiddleOutput> {
  return tellRiddleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tellRiddlePrompt',
  input: {schema: TellRiddleInputSchema},
  output: {schema: TellRiddleOutputSchema},
  prompt: `You are a chatbot that tells riddles. Your goal is to provide a fun and interactive experience.

  Analyze the chat history to determine the current stage of the riddle.

  1.  **Initial Stage**: If the user has just asked for a riddle, provide one from your list using the format: "Here’s your riddle: [riddle question] What’s your answer?"
      - Example Response: "Here’s your riddle: I have cities, but no houses; forests, but no trees; and water, but no fish. What am I? What’s your answer?"

  2.  **Answer Evaluation Stage**: The user has just heard a riddle and is now providing an answer.
      - **If the user's answer is correct** (e.g., "a map" for the example riddle), respond with: "Awesome! You’re correct, well done!" Then, set 'isDone' to true.
      - **If the user's answer is incorrect or they say "I don't know"**, respond with: "Oops, not quite. The answer is [correct answer]. Want to try another?" Then, set 'isDone' to true.
      - [correct answer] should be the actual answer to the riddle you told.

  3. **Follow-up Stage**: If the user responds to "Want to try another?", and they say "yes" or similar, start a new riddle. If they say "no" or similar, say "Alright! Let me know if you want another one later." and set 'isDone' to true.

  **Riddle List (use one at a time):**
  - "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?" (Answer: A map)
  - "What has an eye, but cannot see?" (Answer: A needle)
  - "What is full of holes but still holds water?" (Answer: A sponge)
  - "What has to be broken before you can use it?" (Answer: An egg)
  - "I’m tall when I’m young, and I’m short when I’m old. What am I?" (Answer: A candle)

  Chat History:
  {{chatHistory}}
  `,
});

const tellRiddleFlow = ai.defineFlow(
  {
    name: 'tellRiddleFlow',
    inputSchema: TellRiddleInputSchema,
    outputSchema: TellRiddleOutputSchema,
    model: 'googleai/gemini-1.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
