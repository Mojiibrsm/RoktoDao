/**
 * @fileoverview This file initializes the Genkit AI framework and exports the
 * configured `ai` object for use throughout the application.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
  // Log developer-friendly errors
  devLogger: 'dev',
  // Log structured JSON in production
  prodLogger: 'json',
});
