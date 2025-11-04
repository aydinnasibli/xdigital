import { defineType, defineField } from 'sanity'

export const comparisonFeature = defineType({
    name: 'comparisonFeature',
    title: 'Comparison Feature',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Feature Name',
            type: 'string',
            description: 'e.g., "Pages Included", "Custom Design"',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'key',
            title: 'Feature Key',
            type: 'string',
            description: 'Unique identifier (e.g., "pages", "customDesign")',
            validation: (Rule) => Rule.required().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, {
                name: 'camelCase',
                invert: false
            }).error('Must be camelCase without spaces'),
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order in which features appear in comparison table',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'Optional description for tooltip or help text',
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