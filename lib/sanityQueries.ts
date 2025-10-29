import { client } from "@/sanity/lib/client";





export interface PricingPackage {
  _id: string
  _createdAt: string
  name: string
  description: string
  price: string
  timeline: string
  features: string[]
  idealFor: string
  popular: boolean
  order: number
}



export interface FaqWeb {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export async function getPricingPackages(): Promise<PricingPackage[]> {
  const query = `*[_type == "pricingPackage"] | order(order asc) {
    _id,
    _createdAt,
    name,
    description,
    price,
    timeline,
    features,
    idealFor,
    popular,
    order
  }`

  return await client.fetch(query)
}

export const getFaqWeb = async (): Promise<FaqWeb[]> => {
  try {
    return await client.fetch(`
      *[_type == "faq"] | order(order asc) {
        _id,
        question,
        answer,
        order
      }
    `);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
};