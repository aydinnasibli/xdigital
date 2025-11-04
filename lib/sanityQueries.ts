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
  comparisonValues?: Record<string, string | boolean>
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
    comparisonValues[] {
      "key": feature->key,
      value
    }
  }`

  const packages = await client.fetch(query)

  // Transform comparisonValues array to object with feature keys
  return packages.map((pkg: any) => ({
    ...pkg,
    comparisonValues: pkg.comparisonValues?.reduce((acc: Record<string, string | boolean>, item: any) => {
      if (item.key && item.value !== undefined) {
        // Convert "true"/"false" strings to booleans
        if (item.value.toLowerCase() === 'true') {
          acc[item.key] = true;
        } else if (item.value.toLowerCase() === 'false') {
          acc[item.key] = false;
        } else {
          acc[item.key] = item.value;
        }
      }
      return acc;
    }, {}) || {}
  }))
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