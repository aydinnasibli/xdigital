import { client } from "@/sanity/lib/client";

export interface FaqWeb {
  _id: string;
  question: string;
  answer: string;
}

export const getFaqWeb = async (): Promise<FaqWeb[]> => {
  try {
    return await client.fetch(`
      *[_type == "faq"] | order(_createdAt desc) {
        _id,
        question,
        answer
      }
    `);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
};