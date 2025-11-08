import { defineType, defineField } from 'sanity'

export const pricingPackage = defineType({
    name: 'pricingPackage',
    title: 'Pricing Package',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Package Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Monthly Price',
            type: 'string',
            description: 'e.g., $299/mo or Custom',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'setupFee',
            title: 'Setup Fee (Optional)',
            type: 'string',
            description: 'One-time setup cost, e.g., $500',
        }),
        defineField({
            name: 'timeline',
            title: 'Initial Setup Timeline',
            type: 'string',
            description: 'e.g., 2-3 weeks for first delivery',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }],
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: 'templatesIncluded',
            title: 'Number of Templates Included',
            type: 'string',
            description: 'e.g., "5 templates" or "All templates from lower tiers + 10 exclusive"',
        }),
        defineField({
            name: 'customizationRequests',
            title: 'Monthly Customization Requests',
            type: 'string',
            description: 'e.g., "2 requests/month" or "Unlimited"',
        }),
        defineField({
            name: 'idealFor',
            title: 'Ideal For',
            type: 'string',
            description: 'Target audience description',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'popular',
            title: 'Popular Package',
            type: 'boolean',
            description: 'Mark this package as most popular',
            initialValue: false,
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order in which packages appear (lower numbers first)',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'comparisonValues',
            title: 'Comparison Table Values',
            type: 'array',
            description: 'Set values for each comparison feature',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'feature',
                            title: 'Feature',
                            type: 'reference',
                            to: [{ type: 'comparisonFeature' }],
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: 'value',
                            title: 'Value',
                            type: 'string',
                            description: 'Enter value: for boolean use "true"/"false", for text use any string',
                            validation: (Rule) => Rule.required(),
                        },
                    ],
                    preview: {
                        select: {
                            featureName: 'feature.name',
                            value: 'value',
                        },
                        prepare({ featureName, value }) {
                            return {
                                title: featureName || 'Unknown Feature',
                                subtitle: value,
                            }
                        },
                    },
                },
            ],
        }),
    ],
    orderings: [
        {
            title: 'Display Order',
            name: 'orderAsc',
            by: [{ field: 'order', direction: 'asc' }],
        },
    ],
})