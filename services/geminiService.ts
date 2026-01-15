
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProjectSpec = async (
  brainDump: string,
  targetStack: string
) => {
  const client = getClient();

  const prompt = `
    Act as a World-Class Senior Systems Architect and Engineering Manager.
    Brain Dump: ${brainDump}
    Target Tech Stack: ${targetStack}

    Transform this messy brain dump into a production-grade software specification in STRICT JSON format:
    - "prd": A comprehensive Product Requirements Document in markdown.
    - "featureList": An array of specific, atomic features to build.
    - "userFlows": An array describing the key user journeys.
    - "styleGuide": An object with "fonts", "colors" (hex codes), and "vibe" (descriptive theme).
    - "ai_instructions": A specific set of instructions to copy-paste into an AI Coding Agent's .cursorrules file.

    Return ONLY raw JSON.
  `;

  const response = await client.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  // Ensure we return a string to avoid breakage in components
  return response.text || "";
};

// Fix: Renamed generateVisualMockup to generateImage to match the expected export in ImageGenLab.tsx.
// Removed the restrictive UI/UX prefix to allow users to experiment with various styles in the Lab.
export const generateImage = async (prompt: string) => {
  const client = getClient();

  const response = await client.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated");
};

// auditLogicCode function removed - SeoAnalyzer tool not used in any course
/*
export const auditLogicCode = async (codeSnippet: string) => {
  const client = getClient();
  
  const prompt = `
    Act as a Security Auditor and Senior Backend Engineer. 
    Review the following code or logic description for security vulnerabilities, edge cases, and architectural flaws:
    "${codeSnippet}"

    Return a JSON object with:
    - "securityScore": number (1-100)
    - "vulnerabilities": array of strings
    - "edgeCases": array of strings (e.g., 'What happens if user loses connection?')
    - "refactorSuggestions": array of strings
  `;

  const response = await client.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: prompt,
    config: {
        responseMimeType: 'application/json'
    }
  });

  // Ensure we return a string to avoid breakage in components
  return response.text || "";
};
*/

