'use server';
/**
 * @fileOverview A flow for searching hospitals using Google Custom Search API.
 * 
 * - searchHospitals - A function that handles the hospital search process.
 * - HospitalSearchResult - The type for a single hospital search result.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import "server-only";

const HospitalSearchInputSchema = z.string();

const HospitalSearchResultSchema = z.object({
  title: z.string().describe("The name of the hospital."),
  link: z.string().describe("A link to the hospital's website or information page."),
  snippet: z.string().describe("A short description or address of the hospital."),
});
export type HospitalSearchResult = z.infer<typeof HospitalSearchResultSchema>;

const HospitalSearchOutputSchema = z.array(HospitalSearchResultSchema);


export async function searchHospitals(query: string): Promise<HospitalSearchResult[]> {
  return searchHospitalsFlow(query);
}

const searchHospitalsFlow = ai.defineFlow(
  {
    name: 'searchHospitalsFlow',
    inputSchema: HospitalSearchInputSchema,
    outputSchema: HospitalSearchOutputSchema,
  },
  async (query) => {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !engineId) {
      console.error("Google Search API Key or Engine ID is not set in environment variables.");
      // Return an empty array or a default list if keys are missing
      return [];
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query + ' hospital in Bangladesh')}&num=10`;

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Google Custom Search API request failed:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.items) {
        return [];
      }

      const results: HospitalSearchResult[] = data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
      
      return results;

    } catch (error) {
      console.error("Error calling Google Custom Search API:", error);
      // In case of an error, return an empty list to prevent the app from crashing.
      return [];
    }
  }
);
