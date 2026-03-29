import { GoogleGenAI, Type } from "@google/genai";
import { CvData, AnalysisResult, MindMapNode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_CHAT = 'gemini-3-pro-preview';
const MODEL_SEARCH = 'gemini-3-flash-preview';

export const analyzeJobAndProfile = async (
  jobDescription: string,
  currentCvText: string
): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert ATS Resume Auditor. Analyze the following Job Description (JD) and User's Current CV/Profile Information.
    
    Goal: Identify gaps to reach a 100% ATS match score.
    
    Job Description:
    ${jobDescription}

    User Profile/CV:
    ${currentCvText}

    Return a JSON object with:
    1. 'score': An estimated current ATS match score (0-100).
    2. 'missingInfo': A list of critical missing information (e.g., specific skills mentioned in JD but missing in CV, missing metrics, missing portfolio links).
    3. 'keywords': Top 10 ATS keywords found in the JD.
    4. 'mindMap': A hierarchical plan (tree structure) to build the perfect CV. The root node should be "100% ATS CV". Children should be the steps: "Strategy", "Content Optimization", "Formatting". Under "Content Optimization", include specific missing sections or skills to fix.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          mindMap: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['pending', 'in-progress', 'completed'] },
              details: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    status: { type: Type.STRING },
                    details: { type: Type.STRING },
                    children: { 
                      type: Type.ARRAY, 
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          status: { type: Type.STRING },
                          details: { type: Type.STRING }
                        }
                      } 
                    }
                  }
                }
              }
            },
            required: ['name', 'status', 'children']
          }
        },
        required: ['score', 'missingInfo', 'keywords', 'mindMap']
      }
    }
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
};

export const generateCvSection = async (
  section: 'summary' | 'experience' | 'skills' | 'projects',
  jobDescription: string,
  userContext: string,
  extraUserInputs: string
): Promise<any> => {
  let schema;
  let promptDetails = "";

  if (section === 'summary') {
    promptDetails = "Write a powerful professional summary (max 4 lines) tailored to the JD. Highlight specific achievements and alignment with the role.";
    schema = { type: Type.STRING };
  } else if (section === 'skills') {
    promptDetails = "List top 15-20 technical and soft skills, strictly matching JD keywords. Group them logically if needed, but return a flat list for now.";
    schema = { type: Type.ARRAY, items: { type: Type.STRING } };
  } else if (section === 'experience') {
    promptDetails = "Refine the work experience. Use the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]). Focus on outcomes, not duties. Add strong verbs and metrics.";
    schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['role', 'company', 'duration', 'description']
      }
    };
  } else if (section === 'projects') {
    promptDetails = "List relevant projects that prove skills mentioned in JD. Include name, concise description with tech stack used.";
    schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          link: { type: Type.STRING }
        }
      }
    };
  }

  const prompt = `
    Job Description: ${jobDescription}
    User Context: ${userContext}
    User Answers to Missing Info: ${extraUserInputs}

    Task: ${promptDetails}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (section === 'summary') return JSON.parse(response.text || '""');
  return JSON.parse(response.text || '[]');
};

export const chatWithCoach = async (
  history: {role: 'user' | 'model', parts: [{ text: string }]} [],
  message: string,
  context: string,
  useSearch: boolean = false
): Promise<{ text: string, sources?: { title: string, uri: string }[] }> => {
  
  const modelToUse = useSearch ? MODEL_SEARCH : MODEL_CHAT;
  const config: any = {};
  
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  // Note: For gemini-3-pro-preview (chat) we use normal chat.
  // For gemini-3-flash-preview + search, we use generateContent because tools are more straightforward there 
  // without managing chat session state complexities with tools sometimes.
  // However, ai.chats.create works with tools too. Let's try to be consistent.

  if (useSearch) {
    // Single turn with context for search to ensure it gets the query right
    // We append the context to the message for search queries to ensure it knows what to look for
    const searchPrompt = `Context: ${context}\n\nUser Query: ${message}`;
    
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: searchPrompt,
      config: config
    });
    
    const text = response.text || "I couldn't find information on that.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map((c: any) => c.web).filter((w: any) => w) || [];

    return { text, sources };
  } else {
    // Normal conversational chat
    const chat = ai.chats.create({
      model: modelToUse,
      history: [
        {
          role: 'user',
          parts: [{ text: `System Context: You are an expert Career Coach helping the user build a CV. Here is the background info: ${context}. Be concise, helpful, and focused on gathering missing info for the CV.` }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am ready to help refine the CV and ask clarifying questions." }]
        },
        ...history
      ]
    });

    const result = await chat.sendMessage({ message });
    return { text: result.text || "" };
  }
};
