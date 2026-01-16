import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (
  productName: string,
  keywords: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return "Vui lòng cấu hình API Key để sử dụng tính năng này.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Viết một mô tả sản phẩm hấp dẫn, chuẩn SEO cho một website bán nông sản. 
      Tên sản phẩm: ${productName}.
      Từ khóa/Đặc điểm: ${keywords}.
      Viết bằng tiếng Việt, giọng văn tự nhiên, thân thiện, nhấn mạnh vào độ tươi ngon và nguồn gốc sạch.`,
    });

    return response.text || "Không thể tạo nội dung lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi gọi AI.";
  }
};
