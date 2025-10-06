
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generatePodcastScript(blogText: string): Promise<string> {
  const prompt = `
    You are an expert podcast scriptwriter. Your task is to transform the following blog post into a conversational, engaging, and natural-sounding podcast script.

    **Instructions:**
    1.  Start with a brief, catchy intro. Something like "Welcome to the show..." or a question related to the topic.
    2.  Rewrite the blog content in a spoken-word format. Use shorter sentences and a more personal, conversational tone. Address the listener directly (e.g., "you might be wondering...", "think about it this way...").
    3.  Break down complex topics into easily digestible segments.
    4.  Incorporate natural-sounding pauses for emphasis and pacing.
    5.  End with a concise summary and a friendly outro, like "That's all for today. Thanks for tuning in!".
    6.  The entire output must be a single, clean block of text. Do NOT use any markdown, headers, or special formatting like **bold** or *italics*. The text will be fed directly into a text-to-speech engine.

    **Blog Post Content:**
    ---
    ${blogText}
    ---
  `;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating script from Gemini:", error);
    throw new Error("Could not generate the podcast script.");
  }
}
