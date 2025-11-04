

import { defineField, defineType } from 'sanity';





export const portfolioShowcaseWeb = defineType({
    name: 'PortfolioShowcase',
    title: 'PortfolioShowcase',
    type: 'document',
    fields: [
        defineField({
            name: 'client',
            title: 'Client',
            type: 'string',
            validation: (rule) => rule.required().min(5).max(100),
        }),
        defineField({
            name: 'industry',
            title: 'Industry',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required().min(10),
        }),
        defineField({
            name: 'challenge',
            title: 'Challenge',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required().min(20),
        }),
        defineField({
            name: 'solution',
            title: 'Solution',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required().min(20),
        }),
        defineField({
            name: 'results',
            title: 'Results',
            type: 'object',
            fields: [
                defineField({
                    name: 'conversion',
                    title: 'Conversion Increase',
                    type: 'string',
                    validation: (rule) => rule.required(),
                }),
                defineField({
                    name: 'loadTime',
                    title: 'Load Time',
                    type: 'string',
                    validation: (rule) => rule.required(),
                }),
                defineField({
                    name: 'users',
                    title: 'User Growth',
                    type: 'string',
                    validation: (rule) => rule.required(),
                }),
            ],
        }),
        defineField({
            name: 'color',
            title: 'Color Gradient',
            type: 'string',
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Lower numbers appear first',
            validation: (rule) => rule.required().min(0),
            initialValue: 0,
        }),
    ],
    preview: {
        select: {
            title: 'client',
            subtitle: 'industry',
        },
    },
});