import { defineField, defineType } from 'sanity';

export const faqWeb = defineType({
    name: 'faq',
    title: 'FAQ',
    type: 'document',
    fields: [
        defineField({
            name: 'question',
            title: 'Question',
            type: 'string',
            validation: (rule) => rule.required().min(10).max(200),
        }),
        defineField({
            name: 'answer',
            title: 'Answer',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required().min(20),
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
            title: 'question',
            subtitle: 'answer',
        },
    },
});