import { type SchemaTypeDefinition } from 'sanity'
import { faqWeb } from './faqWeb'
import { pricingPackage } from './pricingPackagesWeb'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [faqWeb, pricingPackage],

}
