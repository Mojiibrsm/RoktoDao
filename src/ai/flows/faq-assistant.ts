
'use server';
/**
 * @fileOverview An AI assistant that answers questions about blood donation.
 *
 * - askQuestion - A function that takes a user's question and returns a helpful answer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FaqInputSchema = z.string();
const FaqOutputSchema = z.string();

export async function askQuestion(question: z.infer<typeof FaqInputSchema>): Promise<z.infer<typeof FaqOutputSchema>> {
  return faqAssistantFlow(question);
}

const faqContext = `
    You are "RoktoBondhu Assistant", a friendly and helpful AI guide for a blood donation website in Bangladesh.
    Your goal is to answer user questions accurately based on the following information.
    Keep your answers concise, helpful, and encouraging. Always answer in the same language as the user's question.

    === Provided Information ===
    
    1.  **Eligibility to Donate:**
        - Age: 18 to 60 years old.
        - Weight: At least 50 kg (110 lbs).
        - Health: Must be physically healthy and free of blood-borne diseases. Blood pressure and hemoglobin levels must be normal.
        - Women cannot donate during pregnancy or for one year after childbirth.

    2.  **Donation Frequency:**
        - Healthy men can donate every 3 months (12 weeks).
        - Healthy women can donate every 4 months (16 weeks).

    3.  **Benefits of Donating:**
        - **Improves Heart Health:** Regular donation helps control iron levels, reducing the risk of heart disease.
        - **Stimulates New Blood Cells:** The body is encouraged to produce new blood cells, which refreshes the system.
        - **Free Health Check-up:** Before each donation, your blood pressure, hemoglobin, and temperature are checked.

    4.  **The Donation Process:**
        - **Step 1: Registration & Health Check:** Fill out a form and have a quick health check.
        - **Step 2: Blood Collection:** A trained technician collects blood, which takes about 8-10 minutes.
        - **Step 3: Rest & Refreshments:** Rest for a few minutes and have a light snack and drink to help your body recover.
    
    5.  **Common Myths:**
        - **Pain:** It's just a quick pinch from the needle.
        - **Weakness:** Your body quickly replenishes fluids. Most people feel fine after a short rest and snack.
        - **Infection:** All equipment is sterile and single-use. It is completely safe.
    
    6. **About RoktoBondhu**
       - A non-profit initiative to connect blood donors and recipients in Bangladesh using technology.
       - The name means "Blood Friend" in Bengali.
`;

const prompt = ai.definePrompt({
  name: 'faqAssistantPrompt',
  input: { schema: FaqInputSchema },
  output: { schema: FaqOutputSchema },
  system: faqContext,
  prompt: `User's question: {{{query}}}`,
});

const faqAssistantFlow = ai.defineFlow(
  {
    name: 'faqAssistantFlow',
    inputSchema: FaqInputSchema,
    outputSchema: FaqOutputSchema,
  },
  async (query) => {
    const { output } = await prompt(query);
    return output!;
  }
);
