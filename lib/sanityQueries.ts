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
  comparisonValues?: {
    pages?: string
    customDesign?: boolean
    responsive?: boolean
    seo?: boolean
    cms?: boolean
    forms?: boolean
    analytics?: boolean
    ecommerce?: boolean
    integrations?: boolean
    support?: boolean
    updates?: boolean
    training?: string
  }
}

export interface FaqWeb {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ComparisonFeature {
  _id: string;
  name: string;
  key: string;
  order: number;
  description?: string;
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
    order,
    comparisonValues
  }`

  return await client.fetch(query)
}

export async function getComparisonFeatures(): Promise<ComparisonFeature[]> {
  const query = `*[_type == "comparisonFeature"] | order(order asc) {
    _id,
    name,
    key,
    order,
    description
  }`

  try {
    return await client.fetch(query)
  } catch (error) {
    console.error("Error fetching comparison features:", error);
    return [];
  }
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