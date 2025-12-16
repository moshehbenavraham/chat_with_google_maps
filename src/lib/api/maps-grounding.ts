/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';

const API_KEY = process.env.API_KEY ?? '';
const SYS_INSTRUCTIONS = "You are a helpful assistant that provides concise answers based on the user's query. Provide details for the top 3 results, unless the user requests less. Provide the name and a concise one line description that highlights a unique, interesting, or fun aspect about the place. Do not state addresses. "

/**
* Calls the Gemini API with the googleSearch tool to get a grounded response.
* @param prompt The user's text prompt.
* @returns An object containing the model's text response and grounding sources.
*/
export async function fetchMapsGroundedResponseSDK({
 prompt,
 enableWidget: _enableWidget = true,
 lat,
 lng,
 systemInstruction,
}: {
 prompt: string;
 enableWidget?: boolean;
 lat?: number;
 lng?: number;
 systemInstruction?: string;
}): Promise<GenerateContentResponse> {
 if (!API_KEY) {
   throw new Error('Missing required environment variable: API_KEY');
 }

 try {
   const ai = new GoogleGenAI({apiKey: API_KEY});

   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK types incomplete for googleMaps tool config
   const request: Record<string, any> = {
     model: 'gemini-2.5-flash',
     contents: prompt,
     config: {
       tools: [{googleMaps: {}}],
       thinkingConfig: {
         thinkingBudget: 0,
       },
       systemInstruction: systemInstruction ?? SYS_INSTRUCTIONS,
     },
   };

   if (lat !== undefined && lng !== undefined) {
     request.toolConfig = {
       retrievalConfig: {
         latLng: {
           latitude: lat,
           longitude: lng,
         },
       },
     };
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- SDK types incomplete for googleMaps tool
   const response = await ai.models.generateContent(request as any);
   return (response);
 } catch (error) {
   console.error(`Error calling Google Search grounding: ${String(error)}
   With prompt: ${prompt}`);
   throw error;
 }
}

/**
* Calls the Google AI Platform REST API to get a Maps-grounded response.
* @param options The request parameters.
* @returns A promise that resolves to the API's GenerateContentResponse.
*/
export async function fetchMapsGroundedResponseREST({
 prompt,
 enableWidget = true,
 lat,
 lng,
 systemInstruction,
}: {
 prompt: string;
 enableWidget?: boolean;
 lat?: number;
 lng?: number;
 systemInstruction?: string;
}): Promise<GenerateContentResponse> {
 if (!API_KEY) {
   throw new Error('Missing required environment variable: API_KEY');
 }
 const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- REST API body structure not fully typed
const requestBody: Record<string, any> = {
   contents: [
     {
       parts: [
         {
           text: prompt,
         },
       ],
     },
   ],
   system_instruction: {
       parts: [ { text: systemInstruction ?? SYS_INSTRUCTIONS } ]
   },
   tools: [
     {
       google_maps: {
        enable_widget: enableWidget
       },
     },
   ],
   generationConfig: {
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
 };

 if (lat !== undefined && lng !== undefined) {
   requestBody.toolConfig = {
     retrievalConfig: {
       latLng: {
         latitude: lat,
         longitude: lng,
       },
     },
   };
 }

 try {
   const response = await fetch(endpoint, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'x-goog-api-key': API_KEY,
     },
     body: JSON.stringify(requestBody),
   });

   if (!response.ok) {
     const errorBody = await response.text();
     console.error('Error from Generative Language API:', errorBody);
     throw new Error(
       `API request failed with status ${String(response.status)}: ${errorBody}`,
     );
   }

   const data: unknown = await response.json();
   return data as GenerateContentResponse;
 } catch (error) {
   console.error(`Error calling Maps grounding REST API: ${String(error)}`);
   throw error;
 }
}
