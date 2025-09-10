import { config } from 'dotenv';
config();

import '@/ai/flows/smart-fallback-to-helpdesk.ts';
import '@/ai/flows/answer-student-queries.ts';
import '@/ai/flows/create-timetable.ts';
import '@/ai/flows/tell-riddle-flow.ts';
