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
            title: 'Price',
            type: 'string',
            description: 'e.g., $3,500 or Custom',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'timeline',
            title: 'Timeline',
            type: 'string',
            description: 'e.g., 2-3 weeks',
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
        // DYNAMIC COMPARISON VALUES - References the comparison features you create
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
                            description: 'Enter value: for boolean use "true"/"false", for text use any string (e.g., "5-10 pages", "Unlimited")',
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