import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const model = "gemini-3-flash-preview";

export interface BoardElement {
  id: string;
  type: 'text' | 'summary' | 'concept' | 'action' | 'chat';
  content: string;
  timestamp: number;
  metadata?: any;
}

export async function askAI(question: string, context: string, language: string, aiModel: string = "gemini-3-flash-preview"): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: aiModel,
      contents: `Context: ${context}\n\nQuestion: ${question}`,
      config: {
        systemInstruction: `You are a helpful assistant for a smart board application called "Idrak". 
        Provide clear, concise answers in ${language === 'ar-SA' ? 'Arabic' : 'English'}.`,
      },
    });
    return response.text || (language === 'ar-SA' ? "لا يوجد رد من الذكاء الاصطناعي." : "No response from AI.");
  } catch (error) {
    console.error("AI Error:", error);
    return language === 'ar-SA' ? "خطأ في الاتصال بالذكاء الاصطناعي." : "Error connecting to AI.";
  }
}

export async function generateFullSummary(transcript: string, language: string, aiModel: string = "gemini-3-flash-preview"): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: aiModel,
      contents: `Please summarize the following transcript in ${language === 'ar-SA' ? 'Arabic' : 'English'}:\n\n${transcript}`,
      config: {
        systemInstruction: "You are an expert summarizer. Create a structured, easy-to-read summary with bullet points if necessary.",
      },
    });
    return response.text || (language === 'ar-SA' ? "لم يتم إنشاء ملخص." : "No summary generated.");
  } catch (error) {
    console.error("AI Error:", error);
    return language === 'ar-SA' ? "خطأ في إنشاء الملخص." : "Error generating summary.";
  }
}

export async function generateQuiz(transcript: string, language: string, aiModel: string = "gemini-3-flash-preview"): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: aiModel,
      contents: `Based on this transcript, generate a 3-question multiple choice quiz in ${language === 'ar-SA' ? 'Arabic' : 'English'}:\n\n${transcript}`,
      config: {
        systemInstruction: "You are an educational assistant. Create a clear quiz with questions, options (A, B, C, D), and the correct answer at the end.",
      },
    });
    return response.text || (language === 'ar-SA' ? "لم يتم إنشاء اختبار." : "No quiz generated.");
  } catch (error) {
    console.error("AI Error:", error);
    return language === 'ar-SA' ? "خطأ في إنشاء الاختبار." : "Error generating quiz.";
  }
}

export async function translateTranscript(transcript: string, targetLanguage: string, aiModel: string = "gemini-3-flash-preview"): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: aiModel,
      contents: `Translate the following text to ${targetLanguage}:\n\n${transcript}`,
      config: {
        systemInstruction: "You are a professional translator. Provide a natural and accurate translation.",
      },
    });
    return response.text || "Translation failed.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error during translation.";
  }
}

export async function generateBoardTitle(transcript: string, language: string, aiModel: string = "gemini-3-flash-preview"): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: aiModel,
      contents: `Based on this transcript, generate a very short (2-4 words) catchy and descriptive title in ${language === 'ar-SA' ? 'Arabic' : 'English'}:\n\n${transcript}`,
      config: {
        systemInstruction: "You are a creative titler. Provide ONLY the title text, no quotes or extra words.",
      },
    });
    return response.text?.trim() || (language === 'ar-SA' ? "جلسة جديدة" : "New Session");
  } catch (error) {
    console.error("AI Error:", error);
    return language === 'ar-SA' ? "جلسة جديدة" : "New Session";
  }
}

export async function transcribeAudio(file: File, language: string, aiModel: string = "gemini-3-flash-preview"): Promise<string> {
  try {
    const ai = getAI();
    
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await ai.models.generateContent({
      model: aiModel,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          }
        },
        {
          text: `Please transcribe this audio accurately in ${language === 'ar-SA' ? 'Arabic' : 'English'}. Provide ONLY the transcription, no extra text or markdown.`
        }
      ]
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Audio Transcription Error:", error);
    throw error;
  }
}

export async function generateVisualAid(prompt: string): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create an educational illustration for: ${prompt}. Style: clean, modern, educational.` }],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (error) {
    console.error("Image Gen Error:", error);
    return "";
  }
}
