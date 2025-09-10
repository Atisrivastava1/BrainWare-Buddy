'use server';

/**
 * @fileOverview A flow to help users create a study timetable.
 *
 * - createTimetable - A function that handles the timetable creation process.
 * - CreateTimetableInput - The input type for the createTimetable function.
 * - CreateTimetableOutput - The return type for the createTimetable function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateTimetableInputSchema = z.object({
  chatHistory: z.string().describe('The history of the conversation.'),
});
export type CreateTimetableInput = z.infer<typeof CreateTimetableInputSchema>;

const CreateTimetableOutputSchema = z.object({
  response: z
    .string()
    .describe('The chatbot\'s response to the user.'),
  timetable: z
    .array(z.object({
      time: z.string(),
      subject: z.string(),
    }))
    .optional()
    .describe('The generated timetable.'),
  isDone: z
    .boolean()
    .optional()
    .describe('Whether the timetable creation process is complete.'),
});
export type CreateTimetableOutput = z.infer<typeof CreateTimetableOutputSchema>;

export async function createTimetable(
  input: CreateTimetableInput
): Promise<CreateTimetableOutput> {
  return createTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createTimetablePrompt',
  input: {schema: CreateTimetableInputSchema},
  output: {schema: CreateTimetableOutputSchema},
  prompt: `You are a chatbot helping a student create a study timetable.
  Your goal is to guide the user through the process step-by-step.

  Analyze the chat history to determine the current stage of the conversation.

  1.  **Initial Stage**: If the user wants to create a timetable but hasn't provided subjects, ask for a comma-separated list of subjects.
      - Example Response: "Please provide the subjects you want to schedule, separated by commas."

  2.  **Subjects Provided, Waiting for Time Slots**: If the user has provided subjects but not time slots, ask for the available time slots. Remind them of the format.
      - Example Response: "Great! Now, please provide your available time slots (e.g., 9-10 AM, 10-11 AM)."

  3.  **All Information Provided**: If the user has provided both subjects and time slots, generate the timetable.
      - Parse the subjects and time slots from the user's messages.
      - **Validation**:
        - If the number of time slots is less than the number of subjects, respond with an error: "You have provided more subjects than available time slots. Please provide more time slots or fewer subjects."
        - If inputs are missing, ask for the missing information.
      - **Generation**:
        - If validation passes, create a timetable by assigning each subject to a time slot in order.
        - Format the response to clearly display the timetable.
        - Set the 'timetable' field in the output with the schedule.
        - Ask the user for the next step.
        - Example Response: "Here is your timetable:
          9-10 AM: Math
          10-11 AM: Science
          11-12 PM: English
          Would you like to save, modify, or create a new timetable?"
  
  4. **Final Stage**: If the user confirms to save, or wants to create a new one, or modify, respond accordingly and set 'isDone' to true to end this specific flow.
    - Example for save: "Your timetable has been saved. Do you need help with anything else?"
    - Example for new: "Let's start over. Please provide the subjects you want to schedule, separated by commas."
    - Example for modify: "Timetable modification is not yet supported. Would you like to create a new one?"


  Chat History:
  {{chatHistory}}
  `,
});

const createTimetableFlow = ai.defineFlow(
  {
    name: 'createTimetableFlow',
    inputSchema: CreateTimetableInputSchema,
    outputSchema: CreateTimetableOutputSchema,
    model: 'googleai/gemini-1.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
