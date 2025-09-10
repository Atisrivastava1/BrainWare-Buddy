
'use server';

/**
 * @fileOverview A flow to answer student queries based on a knowledge base.
 *
 * - answerQueryFromContext - A function that handles the student query process.
 * - AnswerQueryFromContextInput - The input type for the answerQueryFromContext function.
 * - AnswerQueryFromContextOutput - The return type for the answerQueryFromContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import knowledgeData from '@/data.json';

const AnswerQueryFromContextInputSchema = z.object({
  query: z.string().describe('The question asked by the student.'),
  context: z.string().describe('The knowledge base content to use for answering the query.'),
  chatHistory: z.string().optional().describe('The history of the conversation.'),
  userName: z.string().optional().describe("The user's name."),
});
export type AnswerQueryFromContextInput = z.infer<typeof AnswerQueryFromContextInputSchema>;

const AnswerQueryFromContextOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question.'),
  isTimetableRequest: z.boolean().optional().describe('Whether the user wants to create a timetable.'),
  isRiddleRequest: z.boolean().optional().describe('Whether the user wants to hear a riddle.'),
});
export type AnswerQueryFromContextOutput = z.infer<typeof AnswerQueryFromContextOutputSchema>;

function findProgram(query: string): string | null {
  const programs = knowledgeData.programs;
  const lowerCaseQuery = query.toLowerCase();

  for (const department in programs) {
    if (lowerCaseQuery.includes(department.toLowerCase())) {
      const courseList = (programs as any)[department].join('\n - ');
      return `The following programs are offered in ${department}:\n - ${courseList}`;
    }
  }
  return null;
}

export async function answerQueryFromContext(input: AnswerQueryFromContextInput): Promise<AnswerQueryFromContextOutput> {
  const lowerCaseQuery = input.query.toLowerCase().trim().replace(/[?]/g, '');

  const qaPairs = knowledgeData.qa_pairs;
  const match = qaPairs.find(pair => 
    pair.q.some(question => lowerCaseQuery.includes(question.toLowerCase().replace(/[?]/g, '')))
  );

  if (match) {
    let answer;
    if (Array.isArray(match.a)) {
      answer = match.a[Math.floor(Math.random() * match.a.length)];
    } else {
      answer = match.a;
    }
    
    if (input.userName) {
      answer = answer.replace(/{{userName}}/g, input.userName);
    }
    return {
      answer,
      isTimetableRequest: lowerCaseQuery.includes("timetable"),
      isRiddleRequest: lowerCaseQuery.includes("riddle"),
    };
  }

  const programAnswer = findProgram(input.query);
  if (programAnswer) {
    return {
      answer: programAnswer,
      isTimetableRequest: false,
      isRiddleRequest: false,
    };
  }
  
  try {
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await answerQueryFromContextFlow(input);
      } catch (error: any) {
        if (error.message.includes('429') && attempts < 2) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("Failed to get response from AI flow:", error);
  }

  return {
    answer: "I'm still learning about that. Could you ask in a different way? Or I can connect you to a human representative.",
    isTimetableRequest: false,
    isRiddleRequest: false,
  };
}

const prompt = ai.definePrompt({
  name: 'answerQueryFromContextPrompt',
  input: {schema: AnswerQueryFromContextInputSchema},
  output: {schema: AnswerQueryFromContextOutputSchema},
  prompt: `You are Brainware Buddy, an AI assistant for Brainware University. Your primary goal is to answer student questions based on the provided context.

  Guidelines:
  1.  **Prioritize Factual Answers**: First, use the provided 'context' to answer the user's question accurately.
  2.  **Conversational Tone**: Maintain a friendly and helpful tone.
  3.  **Handle Timetable & Riddle Requests**: If the user asks for a timetable or a riddle, set the 'isTimetableRequest' or 'isRiddleRequest' flag to true in your response.
  4.  **Empathetic Fallback**: If and only if the context does not contain the answer, respond in a friendly, conversational way. If you don't have the information, say something like "I'm still learning about that. Could you ask in a different way? Or I can connect you to a human representative."

  Context:
  {{{context}}}

  Chat History:
  {{chatHistory}}

  Question: {{{query}}}`
});

const answerQueryFromContextFlow = ai.defineFlow(
  {
    name: 'answerQueryFromContextFlow',
    inputSchema: AnswerQueryFromContextInputSchema,
    outputSchema: AnswerQueryFromContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    