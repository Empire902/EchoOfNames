
import { GoogleGenAI, Type } from "@google/genai";
import { NameAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeNames(firstName: string, lastName: string): Promise<NameAnalysis> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أنت خبير لغوي رفيع المستوى في علوم اللغة العربية، البلاغة، تاريخ العرب، ومعاجم اللغة. 
    حلل الأسماء التالية بأقصى درجات الدقة اللغوية والأمانة العلمية: الاسم الأول "${firstName}"، واسم العائلة "${lastName}".

    قواعد العمل الصارمة:
    1. اللقب الشرفي "unifiedTitle": ابتكار لقب بليغ يجمع بين معنى الاسمين (مثلاً: "المعمر المختار").
    2. الدقة اللغوية: استناداً لأمهات المعاجم (لسان العرب، القاموس المحيط).
    3. الشاعرية: "poeticVerse" مقطوعة شعرية (بيتان) بدون تشكيل.
    4. الكتابة العربية: تجنب التشكيل تماماً لجمالية العرض.

    المطلوب في ملف JSON:
    - "firstNameArabic" و "lastNameArabic": الكتابة الصحيحة.
    - "unifiedTitle": اللقب الشرفي.
    - "poeticVerse": الشعر.
    - "combinedInterpretation": التحليل البلاغي.
    - "firstNameMeaning" و "lastNameMeaning": الشرح اللغوي.
    - "firstNameOrigin" و "lastNameOrigin": (تقني) الدولة الحالية.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          unifiedTitle: { type: Type.STRING },
          poeticVerse: { type: Type.STRING },
          combinedInterpretation: { type: Type.STRING },
          firstNameMeaning: { type: Type.STRING },
          lastNameMeaning: { type: Type.STRING },
          firstNameArabic: { type: Type.STRING },
          lastNameArabic: { type: Type.STRING },
          firstNameOrigin: { type: Type.STRING },
          lastNameOrigin: { type: Type.STRING }
        },
        required: ["unifiedTitle", "poeticVerse", "combinedInterpretation", "firstNameMeaning", "lastNameMeaning", "firstNameArabic", "lastNameArabic", "firstNameOrigin", "lastNameOrigin"]
      }
    }
  });

  const text = response.text.trim();
  try {
    return JSON.parse(text) as NameAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("حدث خطأ في معالجة البيانات، يرجى المحاولة مرة أخرى.");
  }
}
