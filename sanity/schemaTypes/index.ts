import { type SchemaTypeDefinition } from 'sanity'
import { faqWeb } from './faqWeb'
import { pricingPackage } from './pricingPackagesWeb'
import { comparisonFeature } from './comparisonFeature'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [faqWeb, pricingPackage, comparisonFeature],

}
