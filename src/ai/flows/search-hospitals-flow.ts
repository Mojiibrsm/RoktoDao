'use server';
/**
 * @fileOverview A flow for searching hospitals using Google Custom Search's autocomplete API.
 * 
 * - searchHospitals - A function that handles the hospital search process.
 * - HospitalSearchResult - The type for a single hospital search result.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import "server-only";

const HospitalSearchInputSchema = z.string();

// The custom search autocomplete API returns a simple array of strings.
const HospitalSearchResultSchema = z.object({
    title: z.string(),
    snippet: z.string(),
    link: z.string(),
});
export type HospitalSearchResult = z.infer<typeof HospitalSearchResultSchema>;

const HospitalSearchOutputSchema = z.array(HospitalSearchResultSchema);


export async function searchHospitals(query: string): Promise<HospitalSearchResult[]> {
  return searchHospitalsFlow(query);
}

// This flow now uses the autocomplete/suggestion endpoint.
const searchHospitalsFlow = ai.defineFlow(
  {
    name: 'searchHospitalsFlow',
    inputSchema: HospitalSearchInputSchema,
    outputSchema: HospitalSearchOutputSchema,
  },
  async (query) => {
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!engineId) {
      console.error("Google Search Engine ID is not set in environment variables.");
      return [];
    }
    
    // This is the autocomplete/suggestion endpoint, not the main search API.
    const searchUrl = `https://clients1.google.com/complete/search?client=partner-web&hl=en&sugexp=csems&gs_ri=partner-web&partnerid=${engineId}&types=t&ds=cse&cp=4&q=${encodeURIComponent(query + ' hospital in Bangladesh')}&callback=google.sbox.p50`;

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`);
        return [];
      }
      
      // The response is JSONP (e.g., "google.sbox.p50(...)"), so we need to extract the JSON part.
      let text = await response.text();
      const jsonpMatch = text.match(/^google\.sbox\.p\d+\((.*)\)$/);
      
      if (!jsonpMatch || !jsonpMatch[1]) {
        console.error("Failed to parse JSONP response.");
        return [];
      }
      
      const data = JSON.parse(jsonpMatch[1]);

      // The suggestions are in the second element of the array, and each suggestion is an array itself.
      const suggestions = data[1];

      if (!suggestions || !Array.isArray(suggestions)) {
        console.log("No items found in Google Custom Search autocomplete response for query:", query);
        return [];
      }

      // Format the string suggestions into the expected object structure.
      const results: HospitalSearchResult[] = suggestions.map((item: any) => ({
        // The suggestion text is in the first element of the inner array.
        title: item[0], 
        snippet: 'Google Suggestion', // Snippet is not provided by this API
        link: '' // Link is not provided by this API
      }));
      
      return results;

    } catch (error) {
      console.error("Error calling Google Custom Search autocomplete API:", error);
      return [];
    }
  }
);
