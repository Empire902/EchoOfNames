
import { GoogleGenAI, Type } from "@google/genai";
import { NameAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeNames(firstName: string, lastName: string): Promise<NameAnalysis> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أنت خبير لغوي رفيع المستوى في علوم اللغة العربية، البلاغة، تاريخ العرب، ومعاجم اللغة. 
    حلل الأسماء التالية بأقصى درجات الدقة اللغوية والأمانة العلمية: الاسم الأول "${firstName}"، واسم العائلة "${lastName}".

    قواعد العمل الصارمة:
    1. اللقب الشرفي "unifiedTitle": هذا هو أهم جزء. يجب ابتكار لقب بليغ جداً يجمع بين "المعنى الجوهري" للاسم الأول و"المعنى الجوهري" لاسم العائلة في صياغة واحدة فخمة (مثلاً: إذا كان الاسم عمرو (بناء/عمر) ومصطفى (اختيار)، يكون اللقب "المعمر المختار" أو "الباني المجتبى"). اجعل اللقب قصيراً وقوياً ومزدوجاً.
    2. الدقة اللغوية: يجب أن يكون التحليل مستمداً من أمهات المعاجم (لسان العرب، القاموس المحيط).
    3. الشاعرية العالية: "poeticVerse" يجب أن يكون مقطوعة شعرية بليغة (بيتان) **بدون تشكيل (حركات)** لضمان وضوح الخط وجمالية العرض.
    4. الكتابة العربية: تأكد من صحة الإملاء والهمزات بدقة متناهية، مع **تجنب إضافة التشكيل** تماماً في كامل الرد ليكون النص واضحاً وسهل القراءة.
    5. في حالة وجود مرادفات، يرجى اختيار المرادف الشائع الذي يسهل فهمه للعامة بدون تكرار نفس الاسم.

    المطلوب في ملف JSON:
    - "firstNameArabic" و "lastNameArabic": الكتابة الصحيحة للاسمين بالعربية.
    - "unifiedTitle": اللقب الشرفي المدمج الفخم (مثل: المعمر المختار).
    - "poeticVerse": مقطوعة شعرية بليغة بدون تشكيل.
    - "combinedInterpretation": تحليل بلاغي يربط بين اللقب المبتكر وبين معاني الاسمين لغوياً.
    - "firstNameMeaning" و "lastNameMeaning": شرح لغوي مفصل من المعاجم العربية.
    - "firstNameOrigin": (مطلوب تقنياً) الدولة الحالية.
    - "lastNameOrigin": (مطلوب تقنياً) الدولة الحالية.`,
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
