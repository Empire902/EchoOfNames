
import { GoogleGenAI, Type } from "@google/genai";
import { NameAnalysis } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Retries a function with exponential backoff for specific transient errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1500): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isTransient = error.status === 503 || 
                          error.status === 500 || 
                          error.status === 429 ||
                          error.message?.includes('503') ||
                          error.message?.includes('UNAVAILABLE') ||
                          error.message?.includes('Resource has been exhausted');

      if (isTransient && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed with transient error. Retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function analyzeNames(firstName: string, lastName: string): Promise<NameAnalysis> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت خبير لغوي رفيع المستوى في علوم اللغة العربية، البلاغة، تاريخ العرب، ومعاجم اللغة. 
      حلل الأسماء التالية بأقصى درجات الدقة اللغوية والأمانة العلمية: الاسم الأول "${firstName}"، واسم العائلة "${lastName}".

      قواعد العمل الصارمة:
      1. اللقب الشرفي "unifiedTitle": ابتكار لقب بليغ يجمع بين معنى الاسمين.
      2. ميثاق الأصالة "familyLegacy": فقرة بليغة عن إرث العائلة المستخلص من قوة الاسم وعمقه التاريخي.
      3. التوجيه الأخلاقي "combinedInterpretation": حكمة أخلاقية مستمدة من دلالات الاسمين معاً.
      4. الشاعرية "poeticVerse": بيتان من الشعر الفصيح يحاكيان فخر العرب.
      5. تجنب التشكيل تماماً لجمالية العرض.

      المطلوب في ملف JSON:
      - "firstNameArabic" و "lastNameArabic": الكتابة الصحيحة.
      - "unifiedTitle": اللقب الشرفي.
      - "poeticVerse": الشعر.
      - "combinedInterpretation": التوجيه الأخلاقي.
      - "familyLegacy": ميثاق الأصالة.
      - "firstNameMeaning" و "lastNameMeaning": الشرح اللغوي الدقيق.
      - "firstNameOrigin" و "lastNameOrigin": الموطن الأصلي للاسم.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            unifiedTitle: { type: Type.STRING },
            poeticVerse: { type: Type.STRING },
            combinedInterpretation: { type: Type.STRING },
            familyLegacy: { type: Type.STRING },
            firstNameMeaning: { type: Type.STRING },
            lastNameMeaning: { type: Type.STRING },
            firstNameArabic: { type: Type.STRING },
            lastNameArabic: { type: Type.STRING },
            firstNameOrigin: { type: Type.STRING },
            lastNameOrigin: { type: Type.STRING }
          },
          required: ["unifiedTitle", "poeticVerse", "combinedInterpretation", "familyLegacy", "firstNameMeaning", "lastNameMeaning", "firstNameArabic", "lastNameArabic", "firstNameOrigin", "lastNameOrigin"]
        }
      }
    });

    const text = response.text.trim();
    return JSON.parse(text) as NameAnalysis;
  });
}
